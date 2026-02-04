FROM nginx:alpine

# 复制文档和 nginx 配置
COPY . /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Railway 使用 $PORT 环境变量
EXPOSE ${PORT}

CMD ["nginx", "-g", "daemon off;"]
