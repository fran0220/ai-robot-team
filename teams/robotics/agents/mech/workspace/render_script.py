import bpy
import math
import os
from mathutils import Vector

OUTPUT_DIR = "/root/multiagent/team/shared/cad/previews"
HOUSING_GLB = "/root/multiagent/team/shared/cad/go-module/go-module-housing.glb"
ARM_GLB = "/root/multiagent/team/shared/cad/go-module/go-module-arm.glb"

RES_X = 1920
RES_Y = 1080


def clear_scene():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    # Purge orphan data blocks to keep things clean between renders
    for datablock in (
        bpy.data.meshes,
        bpy.data.lights,
        bpy.data.cameras,
        bpy.data.materials,
        bpy.data.images,
    ):
        for block in datablock:
            if block.users == 0:
                datablock.remove(block)


def import_glb(filepath):
    bpy.ops.import_scene.gltf(filepath=filepath)
    scene = bpy.context.scene
    # Remove any imported cameras or lights to keep control consistent
    for obj in list(scene.objects):
        if obj.type in {"CAMERA", "LIGHT"}:
            bpy.data.objects.remove(obj, do_unlink=True)
    return [obj for obj in scene.objects if obj.type == "MESH"]


def make_material(name, base_color, roughness=0.4, metallic=0.0, specular=0.5):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf is None:
        bsdf = mat.node_tree.nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.inputs["Base Color"].default_value = (*base_color, 1.0)
    bsdf.inputs["Roughness"].default_value = roughness
    if "Metallic" in bsdf.inputs:
        bsdf.inputs["Metallic"].default_value = metallic
    if "Specular" in bsdf.inputs:
        bsdf.inputs["Specular"].default_value = specular
    return mat


def assign_material(obj, material):
    if obj.data.materials:
        obj.data.materials.clear()
    obj.data.materials.append(material)


def assign_materials(objects, default_material, overrides=None):
    overrides = overrides or []
    for obj in objects:
        chosen = default_material
        for predicate, mat in overrides:
            if predicate(obj):
                chosen = mat
                break
        assign_material(obj, chosen)


def get_bounds(objects):
    min_v = Vector((float("inf"), float("inf"), float("inf")))
    max_v = Vector((float("-inf"), float("-inf"), float("-inf")))

    for obj in objects:
        for corner in obj.bound_box:
            world_corner = obj.matrix_world @ Vector(corner)
            min_v.x = min(min_v.x, world_corner.x)
            min_v.y = min(min_v.y, world_corner.y)
            min_v.z = min(min_v.z, world_corner.z)
            max_v.x = max(max_v.x, world_corner.x)
            max_v.y = max(max_v.y, world_corner.y)
            max_v.z = max(max_v.z, world_corner.z)

    center = (min_v + max_v) * 0.5
    size = max_v - min_v
    radius = 0.5 * size.length
    max_dim = max(size.x, size.y, size.z)
    return center, size, radius, max_dim


def setup_scene():
    scene = bpy.context.scene
    scene.render.engine = "BLENDER_EEVEE"
    scene.render.resolution_x = RES_X
    scene.render.resolution_y = RES_Y
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    scene.render.film_transparent = False

    # Light gray background
    scene.world.use_nodes = False
    scene.world.color = (0.9, 0.9, 0.9)

    return scene


def add_lights(scene, center, max_dim):
    def area_light(name, location, energy):
        light_data = bpy.data.lights.new(name=name, type="AREA")
        light_data.energy = energy
        light_data.shape = 'RECTANGLE'
        light_data.size = max_dim * 1.5
        light_data.size_y = max_dim
        light_obj = bpy.data.objects.new(name=name, object_data=light_data)
        scene.collection.objects.link(light_obj)
        light_obj.location = location
        light_obj.rotation_euler = (0.0, 0.0, 0.0)
        return light_obj

    dist = max_dim * 2.5
    area_light("Key", center + Vector((dist, dist, dist)), 1500)
    area_light("Fill", center + Vector((-dist, dist, dist * 0.5)), 800)
    area_light("Rim", center + Vector((0, -dist, dist)), 600)


def setup_camera(scene, center, radius, direction):
    cam_data = bpy.data.cameras.new(name="Camera")
    cam_obj = bpy.data.objects.new("Camera", cam_data)
    scene.collection.objects.link(cam_obj)
    scene.camera = cam_obj

    cam_data.lens_unit = 'FOV'
    cam_data.angle = math.radians(45.0)

    direction = direction.normalized()
    distance = max(radius / math.sin(cam_data.angle * 0.5) * 1.2, radius * 3.0)
    cam_obj.location = center + direction * distance
    cam_data.clip_end = distance * 10.0

    target = bpy.data.objects.new("Target", None)
    target.empty_display_size = radius * 0.05
    target.empty_display_type = 'PLAIN_AXES'
    target.location = center
    scene.collection.objects.link(target)

    constraint = cam_obj.constraints.new(type='TRACK_TO')
    constraint.target = target
    constraint.track_axis = 'TRACK_NEGATIVE_Z'
    constraint.up_axis = 'UP_Y'

    return cam_obj


def render_view(glb_path, output_path, direction, material_spec=None, overrides=None):
    clear_scene()
    scene = setup_scene()
    objects = import_glb(glb_path)
    if not objects:
        raise RuntimeError(f"No mesh objects found in {glb_path}")

    if material_spec is not None:
        material = make_material(**material_spec)
        override_mats = []
        for predicate, spec in (overrides or []):
            override_mats.append((predicate, make_material(**spec)))
        assign_materials(objects, material, overrides=override_mats)

    center, _size, radius, max_dim = get_bounds(objects)
    add_lights(scene, center, max_dim)
    setup_camera(scene, center, radius, direction)

    scene.render.filepath = output_path
    bpy.ops.render.render(write_still=True)


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    housing_spec = {
        "name": "HousingWhite",
        "base_color": (0.95, 0.95, 0.95),
        "roughness": 0.3,
        "metallic": 0.0,
        "specular": 0.6,
    }
    arm_spec = {
        "name": "ArmMetalLight",
        "base_color": (0.8, 0.8, 0.8),
        "roughness": 0.2,
        "metallic": 0.7,
        "specular": 0.5,
    }
    wood_spec = {
        "name": "BoardWood",
        "base_color": (0.76, 0.6, 0.42),
        "roughness": 0.45,
        "metallic": 0.0,
        "specular": 0.3,
    }

    def is_board(obj):
        name = obj.name.lower()
        return "board" in name or "go" in name or "chess" in name

    housing_overrides = [(is_board, wood_spec)]

    render_view(
        HOUSING_GLB,
        os.path.join(OUTPUT_DIR, "go-module-front.png"),
        Vector((0.0, 1.0, 0.0)),
        material_spec=housing_spec,
        overrides=housing_overrides,
    )

    render_view(
        HOUSING_GLB,
        os.path.join(OUTPUT_DIR, "go-module-side.png"),
        Vector((1.0, 0.0, 0.0)),
        material_spec=housing_spec,
        overrides=housing_overrides,
    )

    render_view(
        HOUSING_GLB,
        os.path.join(OUTPUT_DIR, "go-module-iso.png"),
        Vector((1.0, -1.0, 1.0)),
        material_spec=housing_spec,
        overrides=housing_overrides,
    )

    render_view(
        ARM_GLB,
        os.path.join(OUTPUT_DIR, "go-module-arm.png"),
        Vector((1.0, -1.0, 0.7)),
        material_spec=arm_spec,
    )


if __name__ == "__main__":
    main()
