// Local vs deploy visibility for principles.
// Localhost: all principles (drafts included). Deployed: published only.
(function (global) {
  function isLocalHost() {
    var host = (global.location && global.location.hostname) || '';
    return host === 'localhost'
      || host === '127.0.0.1'
      || host === '[::1]'
      || host === '0.0.0.0';
  }

  function showDrafts() {
    return isLocalHost();
  }

  function visiblePrinciples() {
    var all = global.PRINCIPLES || [];
    if (showDrafts()) {
      return all.slice();
    }
    return all.filter(function (p) {
      return p.published;
    });
  }

  function isDraftPrinciple(principleOrSlug) {
    if (!showDrafts()) {
      return false;
    }
    if (!principleOrSlug) {
      return false;
    }
    if (typeof principleOrSlug === 'string') {
      var found = (global.PRINCIPLES || []).find(function (p) {
        return p.slug === principleOrSlug;
      });
      return Boolean(found && !found.published);
    }
    return !principleOrSlug.published;
  }

  function currentSlug() {
    var path = (global.location && global.location.pathname) || '';
    var match = path.match(/\/principles\/([^/]+)/);
    return match ? match[1] : null;
  }

  /** Inject a "Draft" badge on local unpublished principle pages. */
  function maybeMountPageBadge() {
    if (!showDrafts()) {
      return;
    }
    var slug = currentSlug();
    if (!isDraftPrinciple(slug)) {
      return;
    }
    if (global.document.querySelector('.principle-draft-badge')) {
      return;
    }
    var host = global.document.body;
    if (!host) {
      return;
    }
    var badge = global.document.createElement('p');
    badge.className = 'principle-draft-badge';
    badge.textContent = 'Draft';
    badge.setAttribute('aria-label', 'Draft principle — local only');
    host.appendChild(badge);
  }

  global.PrinciplesDrafts = {
    isLocalHost: isLocalHost,
    showDrafts: showDrafts,
    visiblePrinciples: visiblePrinciples,
    isDraftPrinciple: isDraftPrinciple,
    maybeMountPageBadge: maybeMountPageBadge,
  };

  if (global.document.readyState === 'loading') {
    global.document.addEventListener('DOMContentLoaded', maybeMountPageBadge);
  } else {
    maybeMountPageBadge();
  }
})(window);
