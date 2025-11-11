# Build Stage 1
# This build created a staging docker image
#

FROM node:20-alpine AS appbuild
WORKDIR /usr/src/csaf-validator-service
COPY . .
RUN npm ci; \
    npm run dist

# Install healthcheck dependencies and copy to dist
WORKDIR /usr/src/csaf-validator-service/health_check
RUN npm ci --omit=dev
RUN cp -r ./ /usr/src/csaf-validator-service/dist/health_check

# Build Stage 2
# This build takes the production build from staging build
#

FROM node:20-alpine
WORKDIR /usr/src/app
RUN apk add hunspell hunspell-en hunspell-de-de; \
	ln -s /usr/share/hunspell/en_US.aff /usr/share/hunspell/en.aff; \
	ln -s /usr/share/hunspell/en_US.dic /usr/share/hunspell/en.dic; \
	ln -s /usr/share/hunspell/de_DE.aff /usr/share/hunspell/de.aff; \
	ln -s /usr/share/hunspell/de_DE.dic /usr/share/hunspell/de.dic 
ENV NODE_ENV=production
COPY --from=appbuild /usr/src/csaf-validator-service/dist /usr/src/app
COPY ./backend/config/development.json /usr/src/app/config/local-production.json

# Check version and available dictionaries
ENV LANG=en

USER node
EXPOSE 8082
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s CMD ["node","health_check/healthcheck.js"]
CMD [ "node", "backend/server.js" ]
