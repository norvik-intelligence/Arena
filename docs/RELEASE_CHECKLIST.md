# Production release gates (all required)
- [ ] Twitch OAuth authorization code flow with PKCE/state, secure server-side session, verified identity and token refresh
- [ ] Kick OAuth with verified creator identity and scoped permissions
- [ ] Twitch EventSub signature and timestamp validation, deduplication, subscription lifecycle
- [ ] Kick webhook signature verification, deduplication, subscription lifecycle
- [ ] Platform event mappings reviewed for monetization policy compliance
- [ ] Authenticated Durable Object join and signed short-lived match tickets
- [ ] Server-authoritative multiplayer simulation, reconnect, spectator limits, abuse prevention
- [ ] Persistent match snapshots and safe expiry/cleanup
- [ ] End-to-end multiplayer tests for 2, 3 and 4 clients; 2v2 team assignment
- [ ] Paid events only from validated platform webhook handlers
- [ ] Rate limits, origin restrictions, CSRF protections and secrets management
- [ ] CI green, staging deployment and load tests
- [ ] Privacy notice, terms, data retention and creator support process
- [ ] Monitoring, alerting, incident response and rollback plan

No live deployment should be described as production-ready until these gates pass.
