/* global UnicodeConverter, CryptoHash, TextToSubURI */

(function executeExpand() {
  'use strict';

  Object.defineProperty(Object, 'expand', {
    value: function expand(target, props) {
      return Object.defineProperties(
        target,
        Object.keys(props).reduce(
          (descriptors, propName) => Object.assign(descriptors, {
            [propName]: Object.assign(
              Object.getOwnPropertyDescriptor(props, propName), {
                enumerable: false
              }
            )
          }),
          {}
        )
      );
    },
    writable: true,
    enumerable: false,
    configurable: true
  });

  Object.expand(Array, {
    wrap(target) {
      return target == null ? [] : (Array.isArray(target) ? target : [target]);
    },
    hashtags(tags) {
      return Array.isArray(tags) && tags.length ? tags.reduce((list, tag) => {
        if (String.usable(tag)) {
          list.push(tag.startsWith('#') ? tag : '#' + tag);
        }

        return list;
      }, []) : [];
    }
  });

  Object.expand(Array.prototype, {
    merge(items, option) {
      let master = this.slice();
      let branch = Array.wrap(items);
      let {indexFunc, after} = Object.assign({
        indexFunc: null,
        after: false
      }, option);

      if (indexFunc) {
        let idx = master.findIndex(indexFunc);

        if (idx !== -1) {
          master.splice(after ? idx + 1 : idx, 0, ...branch);

          return master;
        }
      } else if (!after) {
        return branch.concat(master);
      }

      return master.concat(branch);
    }
  });

  Object.expand(JSON, {
    parseable(target) {
      try {
        JSON.parse(target);
      } catch (err) {
        return false;
      }

      return true;
    }
  });

  Object.expand(Object, {
    type(target) {
      return Object.prototype.toString.call(target).slice(8, -1);
    },
    values(target) {
      return target == null ? [] : (
        Object.keys(target).map(propName => target[propName])
      );
    },
    entries(target) {
      return target == null ? [] : (
        Object.keys(target).map(propName => [propName, target[propName]])
      );
    }
  });

  Object.expand(String, {
    usable(target) {
      if (typeof target === 'string') {
        return Boolean(target);
      }

      if (
        Object.type(target) === 'String' && Object(target) instanceof String
      ) {
        return Boolean(String(target));
      }

      return false;
    }
  });

  Object.expand(String.prototype, {
    indent(num, char) {
      return this.replace(/^/mg, (char || ' ').repeat(num));
    },
    wrap(prefix, suffix) {
      return prefix == null ? this : (
        prefix + this + (suffix == null ? prefix : suffix)
      );
    },
    extract(re, group) {
      let match = this.match(re);

      return match ? match[group == null ? 1 : group] : '';
    },
    capitalize() {
      return this.slice(0, 1).toUpperCase() + this.slice(1);
    },
    convertToUnicode(charset) {
      return new UnicodeConverter(charset).ConvertToUnicode(this);
    },
    convertFromUnicode(charset) {
      return new UnicodeConverter(charset).ConvertFromUnicode(this);
    },
    md5(base64, charset) {
      let crypto = new CryptoHash(CryptoHash.MD5),
          data = new UnicodeConverter(charset).convertToByteArray(this, {});

      crypto.update(data, data.length);

      return base64 ? crypto.finish(true) : crypto.finish(false).split('').map(
        char => ('0' + char.charCodeAt().toString(16)).slice(-2)
      ).join('');
    },
    unEscapeURI(charset) {
      return TextToSubURI.unEscapeURIForUI(charset || 'UTF-8', this);
    },
    trimTag() {
      return this.replace(/<!--[\s\S]+?-->/gm, '').replace(/<[\s\S]+?>/gm, '');
    },
    get charLength() {
      return [...this].length;
    }
  });
}());
