# Official Ghost image plus three small Railway pieces: wait for MySQL, create
# the owner account on first boot, and let Railway's plain-http healthcheck
# through without Ghost redirecting it to https.
FROM ghost:6.72.0
COPY --chmod=755 railway-entrypoint.sh /usr/local/bin/
COPY railway-setup.cjs railway-health.cjs /usr/local/lib/railway/
ENV NODE_OPTIONS=--require=/usr/local/lib/railway/railway-health.cjs
ENTRYPOINT ["railway-entrypoint.sh"]
CMD ["node", "current/index.js"]
