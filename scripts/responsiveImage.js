/* Builds the <picture> markup for the photography that scripts render at
   runtime (team cards, article cards, article heroes).

   The derivatives live in images/opt/ and are produced by tools/build-images.py.
   For a source of `images/planning-image.jpg` at width 1024 the file names are:

     images/opt/planning-image-1024.webp   <- served to everything modern
     images/opt/planning-image-1024.jpg    <- fallback, same extension as source

   If a source has no derivatives yet, pass no widths and the original is used
   unchanged, so adding a photo never breaks a page. */

var ResponsiveImage = (function () {
  'use strict';

  function stem(src) {
    var file = src.split('/').pop();
    var dot = file.lastIndexOf('.');
    return {
      name: dot === -1 ? file : file.slice(0, dot),
      ext: dot === -1 ? 'jpg' : file.slice(dot + 1).toLowerCase()
    };
  }

  function srcset(src, widths, ext) {
    var parts = stem(src);
    return widths.map(function (w) {
      return 'images/opt/' + parts.name + '-' + w + '.' + ext + ' ' + w + 'w';
    }).join(', ');
  }

  function escapeAttr(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /* options:
       widths   [Number]  derivative widths that exist for this source
       sizes    String    the `sizes` attribute
       alt      String    empty string for decorative images
       className String
       loading  'lazy' | 'eager'
       fetchpriority 'high' | 'low'
       width, height  intrinsic pixel size, to reserve layout space */
  function pictureHTML(src, options) {
    var opts = options || {};
    var cls = opts.className ? ' class="' + escapeAttr(opts.className) + '"' : '';
    var alt = ' alt="' + escapeAttr(opts.alt || '') + '"';
    var loading = ' loading="' + (opts.loading || 'lazy') + '"';
    var decoding = ' decoding="async"';
    var priority = opts.fetchpriority
      ? ' fetchpriority="' + opts.fetchpriority + '"' : '';
    var dims = (opts.width && opts.height)
      ? ' width="' + opts.width + '" height="' + opts.height + '"' : '';
    var sizes = opts.sizes ? ' sizes="' + escapeAttr(opts.sizes) + '"' : '';

    var img = '<img' + cls + ' src="' + escapeAttr(src) + '"' + alt
            + loading + decoding + priority + dims;

    if (!opts.widths || !opts.widths.length) {
      return img + '>';
    }

    var parts = stem(src);
    return '<picture>'
      + '<source type="image/webp" srcset="'
        + escapeAttr(srcset(src, opts.widths, 'webp')) + '"' + sizes + '>'
      + '<source srcset="'
        + escapeAttr(srcset(src, opts.widths, parts.ext)) + '"' + sizes + '>'
      + img + sizes + '>'
      + '</picture>';
  }

  return { pictureHTML: pictureHTML };
})();
