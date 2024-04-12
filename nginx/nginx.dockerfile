FROM debian:latest

RUN apt-get update -y && apt-get upgrade -y && apt-get install wget -y && apt-get install make
# RUN apt install g++ flex bison curl apache2-dev doxygen libyajl-dev \ 
#         ssdeep liblua5.2-dev libgeoip-dev libtool dh-autoreconf libcurl4-gnutls-dev \
#         libxml2 libpcre3-dev libxml2-dev git liblmdb-dev \
#         libpkgconf3 lmdb-doc pkgconf zlib1g-dev libssl-dev -y


# RUN wget https://github.com/SpiderLabs/ModSecurity/releases/download/v3.0.8/modsecurity-v3.0.8.tar.gz
# RUN tar -xvzf modsecurity-v3.0.8.tar.gz

# WORKDIR modsecurity-v3.0.8
# RUN ./build.sh
# RUN ./configure

# RUN make
# RUN make install

# WORKDIR /root
# RUN git clone https://github.com/SpiderLabs/ModSecurity-nginx.git

# RUN wget https://nginx.org/download/nginx-1.20.2.tar.gz
# RUN tar xzf nginx-1.20.2.tar.gz

# RUN useradd -r -M -s /sbin/nologin -d /usr/local/nginx nginx

# WORKDIR nginx-1.20.2
# RUN ./configure --user=nginx --group=nginx --with-pcre-jit --with-debug --with-compat --with-http_ssl_module --with-http_realip_module --add-dynamic-module=/root/ModSecurity-nginx --http-log-path=/var/log/nginx/access.log --error-log-path=/var/log/nginx/error.log

# RUN make
# RUN make modules
# RUN make install

# RUN ln -s /usr/local/nginx/sbin/nginx /usr/local/sbin/

# RUN cp /modsecurity-v3.0.8/modsecurity.conf-recommended /usr/local/nginx/conf/modsecurity.conf
# RUN cp /modsecurity-v3.0.8/unicode.mapping /usr/local/nginx/conf/

# RUN cp /usr/local/nginx/conf/nginx.conf /usr/local/nginx/conf/nginx.conf.bak

# COPY ./conf/nginx.conf /usr/local/nginx/conf/nginx.conf

# RUN sed -i 's/SecRuleEngine DetectionOnly/SecRuleEngine On/' /usr/local/nginx/conf/modsecurity.conf

# WORKDIR /root

# RUN git clone https://github.com/SpiderLabs/owasp-modsecurity-crs.git /usr/local/nginx/conf/owasp-crs

# RUN cp /usr/local/nginx/conf/owasp-crs/crs-setup.conf.example /usr/local/nginx/conf/owasp-crs/crs-setup.conf

# RUN echo "Include owasp-crs/crs-setup.conf" >> /usr/local/nginx/conf/modsecurity.conf
# RUN echo "Include owasp-crs/rules/*.conf" >> /usr/local/nginx/conf/modsecurity.conf

# RUN mkdir -p /etc/nginx/ssl

# COPY tools/setup-ssl.sh /etc/nginx/ssl/

# RUN chmod +x /etc/nginx/ssl/setup-ssl.sh

# EXPOSE 443

# CMD [ "bash", "/etc/nginx/ssl/setup-ssl.sh" ]
WORKDIR /etc
CMD ["tail","-f"]