var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// ../../node_modules/hono/dist/http-exception.js
var HTTPException;
var init_http_exception = __esm({
  "../../node_modules/hono/dist/http-exception.js"() {
    HTTPException = /* @__PURE__ */ __name(class extends Error {
      res;
      status;
      /**
       * Creates an instance of `HTTPException`.
       * @param status - HTTP status code for the exception. Defaults to 500.
       * @param options - Additional options for the exception.
       */
      constructor(status = 500, options) {
        super(options?.message, { cause: options?.cause });
        this.res = options?.res;
        this.status = status;
      }
      /**
       * Returns the response object associated with the exception.
       * If a response object is not provided, a new response is created with the error message and status code.
       * @returns The response object.
       */
      getResponse() {
        if (this.res) {
          const newResponse = new Response(this.res.body, {
            status: this.status,
            headers: this.res.headers
          });
          return newResponse;
        }
        return new Response(this.message, {
          status: this.status
        });
      }
    }, "HTTPException");
  }
});

// ../../node_modules/hono/dist/request/constants.js
var GET_MATCH_RESULT;
var init_constants = __esm({
  "../../node_modules/hono/dist/request/constants.js"() {
    GET_MATCH_RESULT = /* @__PURE__ */ Symbol();
  }
});

// ../../node_modules/hono/dist/utils/body.js
async function parseFormData(request, options) {
  const formData = await request.formData();
  if (formData) {
    return convertFormDataToBodyData(formData, options);
  }
  return {};
}
function convertFormDataToBodyData(formData, options) {
  const form = /* @__PURE__ */ Object.create(null);
  formData.forEach((value, key) => {
    const shouldParseAllValues = options.all || key.endsWith("[]");
    if (!shouldParseAllValues) {
      form[key] = value;
    } else {
      handleParsingAllValues(form, key, value);
    }
  });
  if (options.dot) {
    Object.entries(form).forEach(([key, value]) => {
      const shouldParseDotValues = key.includes(".");
      if (shouldParseDotValues) {
        handleParsingNestedValues(form, key, value);
        delete form[key];
      }
    });
  }
  return form;
}
var parseBody, handleParsingAllValues, handleParsingNestedValues;
var init_body = __esm({
  "../../node_modules/hono/dist/utils/body.js"() {
    init_request();
    parseBody = /* @__PURE__ */ __name(async (request, options = /* @__PURE__ */ Object.create(null)) => {
      const { all = false, dot = false } = options;
      const headers = request instanceof HonoRequest ? request.raw.headers : request.headers;
      const contentType = headers.get("Content-Type");
      if (contentType?.startsWith("multipart/form-data") || contentType?.startsWith("application/x-www-form-urlencoded")) {
        return parseFormData(request, { all, dot });
      }
      return {};
    }, "parseBody");
    __name(parseFormData, "parseFormData");
    __name(convertFormDataToBodyData, "convertFormDataToBodyData");
    handleParsingAllValues = /* @__PURE__ */ __name((form, key, value) => {
      if (form[key] !== void 0) {
        if (Array.isArray(form[key])) {
          ;
          form[key].push(value);
        } else {
          form[key] = [form[key], value];
        }
      } else {
        if (!key.endsWith("[]")) {
          form[key] = value;
        } else {
          form[key] = [value];
        }
      }
    }, "handleParsingAllValues");
    handleParsingNestedValues = /* @__PURE__ */ __name((form, key, value) => {
      let nestedForm = form;
      const keys = key.split(".");
      keys.forEach((key2, index) => {
        if (index === keys.length - 1) {
          nestedForm[key2] = value;
        } else {
          if (!nestedForm[key2] || typeof nestedForm[key2] !== "object" || Array.isArray(nestedForm[key2]) || nestedForm[key2] instanceof File) {
            nestedForm[key2] = /* @__PURE__ */ Object.create(null);
          }
          nestedForm = nestedForm[key2];
        }
      });
    }, "handleParsingNestedValues");
  }
});

// ../../node_modules/hono/dist/utils/url.js
var splitPath, splitRoutingPath, extractGroupsFromPath, replaceGroupMarks, patternCache, getPattern, tryDecode, tryDecodeURI, getPath, getPathNoStrict, mergePath, checkOptionalParameter, _decodeURI, _getQueryParam, getQueryParam, getQueryParams, decodeURIComponent_;
var init_url = __esm({
  "../../node_modules/hono/dist/utils/url.js"() {
    splitPath = /* @__PURE__ */ __name((path) => {
      const paths = path.split("/");
      if (paths[0] === "") {
        paths.shift();
      }
      return paths;
    }, "splitPath");
    splitRoutingPath = /* @__PURE__ */ __name((routePath) => {
      const { groups, path } = extractGroupsFromPath(routePath);
      const paths = splitPath(path);
      return replaceGroupMarks(paths, groups);
    }, "splitRoutingPath");
    extractGroupsFromPath = /* @__PURE__ */ __name((path) => {
      const groups = [];
      path = path.replace(/\{[^}]+\}/g, (match2, index) => {
        const mark = `@${index}`;
        groups.push([mark, match2]);
        return mark;
      });
      return { groups, path };
    }, "extractGroupsFromPath");
    replaceGroupMarks = /* @__PURE__ */ __name((paths, groups) => {
      for (let i = groups.length - 1; i >= 0; i--) {
        const [mark] = groups[i];
        for (let j = paths.length - 1; j >= 0; j--) {
          if (paths[j].includes(mark)) {
            paths[j] = paths[j].replace(mark, groups[i][1]);
            break;
          }
        }
      }
      return paths;
    }, "replaceGroupMarks");
    patternCache = {};
    getPattern = /* @__PURE__ */ __name((label, next) => {
      if (label === "*") {
        return "*";
      }
      const match2 = label.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
      if (match2) {
        const cacheKey = `${label}#${next}`;
        if (!patternCache[cacheKey]) {
          if (match2[2]) {
            patternCache[cacheKey] = next && next[0] !== ":" && next[0] !== "*" ? [cacheKey, match2[1], new RegExp(`^${match2[2]}(?=/${next})`)] : [label, match2[1], new RegExp(`^${match2[2]}$`)];
          } else {
            patternCache[cacheKey] = [label, match2[1], true];
          }
        }
        return patternCache[cacheKey];
      }
      return null;
    }, "getPattern");
    tryDecode = /* @__PURE__ */ __name((str, decoder) => {
      try {
        return decoder(str);
      } catch {
        return str.replace(/(?:%[0-9A-Fa-f]{2})+/g, (match2) => {
          try {
            return decoder(match2);
          } catch {
            return match2;
          }
        });
      }
    }, "tryDecode");
    tryDecodeURI = /* @__PURE__ */ __name((str) => tryDecode(str, decodeURI), "tryDecodeURI");
    getPath = /* @__PURE__ */ __name((request) => {
      const url = request.url;
      const start = url.indexOf("/", url.indexOf(":") + 4);
      let i = start;
      for (; i < url.length; i++) {
        const charCode = url.charCodeAt(i);
        if (charCode === 37) {
          const queryIndex = url.indexOf("?", i);
          const path = url.slice(start, queryIndex === -1 ? void 0 : queryIndex);
          return tryDecodeURI(path.includes("%25") ? path.replace(/%25/g, "%2525") : path);
        } else if (charCode === 63) {
          break;
        }
      }
      return url.slice(start, i);
    }, "getPath");
    getPathNoStrict = /* @__PURE__ */ __name((request) => {
      const result = getPath(request);
      return result.length > 1 && result.at(-1) === "/" ? result.slice(0, -1) : result;
    }, "getPathNoStrict");
    mergePath = /* @__PURE__ */ __name((base, sub, ...rest) => {
      if (rest.length) {
        sub = mergePath(sub, ...rest);
      }
      return `${base?.[0] === "/" ? "" : "/"}${base}${sub === "/" ? "" : `${base?.at(-1) === "/" ? "" : "/"}${sub?.[0] === "/" ? sub.slice(1) : sub}`}`;
    }, "mergePath");
    checkOptionalParameter = /* @__PURE__ */ __name((path) => {
      if (path.charCodeAt(path.length - 1) !== 63 || !path.includes(":")) {
        return null;
      }
      const segments = path.split("/");
      const results = [];
      let basePath = "";
      segments.forEach((segment) => {
        if (segment !== "" && !/\:/.test(segment)) {
          basePath += "/" + segment;
        } else if (/\:/.test(segment)) {
          if (/\?/.test(segment)) {
            if (results.length === 0 && basePath === "") {
              results.push("/");
            } else {
              results.push(basePath);
            }
            const optionalSegment = segment.replace("?", "");
            basePath += "/" + optionalSegment;
            results.push(basePath);
          } else {
            basePath += "/" + segment;
          }
        }
      });
      return results.filter((v, i, a) => a.indexOf(v) === i);
    }, "checkOptionalParameter");
    _decodeURI = /* @__PURE__ */ __name((value) => {
      if (!/[%+]/.test(value)) {
        return value;
      }
      if (value.indexOf("+") !== -1) {
        value = value.replace(/\+/g, " ");
      }
      return value.indexOf("%") !== -1 ? tryDecode(value, decodeURIComponent_) : value;
    }, "_decodeURI");
    _getQueryParam = /* @__PURE__ */ __name((url, key, multiple) => {
      let encoded;
      if (!multiple && key && !/[%+]/.test(key)) {
        let keyIndex2 = url.indexOf("?", 8);
        if (keyIndex2 === -1) {
          return void 0;
        }
        if (!url.startsWith(key, keyIndex2 + 1)) {
          keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
        }
        while (keyIndex2 !== -1) {
          const trailingKeyCode = url.charCodeAt(keyIndex2 + key.length + 1);
          if (trailingKeyCode === 61) {
            const valueIndex = keyIndex2 + key.length + 2;
            const endIndex = url.indexOf("&", valueIndex);
            return _decodeURI(url.slice(valueIndex, endIndex === -1 ? void 0 : endIndex));
          } else if (trailingKeyCode == 38 || isNaN(trailingKeyCode)) {
            return "";
          }
          keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
        }
        encoded = /[%+]/.test(url);
        if (!encoded) {
          return void 0;
        }
      }
      const results = {};
      encoded ??= /[%+]/.test(url);
      let keyIndex = url.indexOf("?", 8);
      while (keyIndex !== -1) {
        const nextKeyIndex = url.indexOf("&", keyIndex + 1);
        let valueIndex = url.indexOf("=", keyIndex);
        if (valueIndex > nextKeyIndex && nextKeyIndex !== -1) {
          valueIndex = -1;
        }
        let name = url.slice(
          keyIndex + 1,
          valueIndex === -1 ? nextKeyIndex === -1 ? void 0 : nextKeyIndex : valueIndex
        );
        if (encoded) {
          name = _decodeURI(name);
        }
        keyIndex = nextKeyIndex;
        if (name === "") {
          continue;
        }
        let value;
        if (valueIndex === -1) {
          value = "";
        } else {
          value = url.slice(valueIndex + 1, nextKeyIndex === -1 ? void 0 : nextKeyIndex);
          if (encoded) {
            value = _decodeURI(value);
          }
        }
        if (multiple) {
          if (!(results[name] && Array.isArray(results[name]))) {
            results[name] = [];
          }
          ;
          results[name].push(value);
        } else {
          results[name] ??= value;
        }
      }
      return key ? results[key] : results;
    }, "_getQueryParam");
    getQueryParam = _getQueryParam;
    getQueryParams = /* @__PURE__ */ __name((url, key) => {
      return _getQueryParam(url, key, true);
    }, "getQueryParams");
    decodeURIComponent_ = decodeURIComponent;
  }
});

// ../../node_modules/hono/dist/request.js
var tryDecodeURIComponent, HonoRequest;
var init_request = __esm({
  "../../node_modules/hono/dist/request.js"() {
    init_http_exception();
    init_constants();
    init_body();
    init_url();
    tryDecodeURIComponent = /* @__PURE__ */ __name((str) => tryDecode(str, decodeURIComponent_), "tryDecodeURIComponent");
    HonoRequest = /* @__PURE__ */ __name(class {
      /**
       * `.raw` can get the raw Request object.
       *
       * @see {@link https://hono.dev/docs/api/request#raw}
       *
       * @example
       * ```ts
       * // For Cloudflare Workers
       * app.post('/', async (c) => {
       *   const metadata = c.req.raw.cf?.hostMetadata?
       *   ...
       * })
       * ```
       */
      raw;
      #validatedData;
      // Short name of validatedData
      #matchResult;
      routeIndex = 0;
      /**
       * `.path` can get the pathname of the request.
       *
       * @see {@link https://hono.dev/docs/api/request#path}
       *
       * @example
       * ```ts
       * app.get('/about/me', (c) => {
       *   const pathname = c.req.path // `/about/me`
       * })
       * ```
       */
      path;
      bodyCache = {};
      constructor(request, path = "/", matchResult = [[]]) {
        this.raw = request;
        this.path = path;
        this.#matchResult = matchResult;
        this.#validatedData = {};
      }
      param(key) {
        return key ? this.#getDecodedParam(key) : this.#getAllDecodedParams();
      }
      #getDecodedParam(key) {
        const paramKey = this.#matchResult[0][this.routeIndex][1][key];
        const param = this.#getParamValue(paramKey);
        return param && /\%/.test(param) ? tryDecodeURIComponent(param) : param;
      }
      #getAllDecodedParams() {
        const decoded = {};
        const keys = Object.keys(this.#matchResult[0][this.routeIndex][1]);
        for (const key of keys) {
          const value = this.#getParamValue(this.#matchResult[0][this.routeIndex][1][key]);
          if (value !== void 0) {
            decoded[key] = /\%/.test(value) ? tryDecodeURIComponent(value) : value;
          }
        }
        return decoded;
      }
      #getParamValue(paramKey) {
        return this.#matchResult[1] ? this.#matchResult[1][paramKey] : paramKey;
      }
      query(key) {
        return getQueryParam(this.url, key);
      }
      queries(key) {
        return getQueryParams(this.url, key);
      }
      header(name) {
        if (name) {
          return this.raw.headers.get(name) ?? void 0;
        }
        const headerData = {};
        this.raw.headers.forEach((value, key) => {
          headerData[key] = value;
        });
        return headerData;
      }
      async parseBody(options) {
        return this.bodyCache.parsedBody ??= await parseBody(this, options);
      }
      #cachedBody = (key) => {
        const { bodyCache, raw: raw2 } = this;
        const cachedBody = bodyCache[key];
        if (cachedBody) {
          return cachedBody;
        }
        const anyCachedKey = Object.keys(bodyCache)[0];
        if (anyCachedKey) {
          return bodyCache[anyCachedKey].then((body) => {
            if (anyCachedKey === "json") {
              body = JSON.stringify(body);
            }
            return new Response(body)[key]();
          });
        }
        return bodyCache[key] = raw2[key]();
      };
      /**
       * `.json()` can parse Request body of type `application/json`
       *
       * @see {@link https://hono.dev/docs/api/request#json}
       *
       * @example
       * ```ts
       * app.post('/entry', async (c) => {
       *   const body = await c.req.json()
       * })
       * ```
       */
      json() {
        return this.#cachedBody("text").then((text) => JSON.parse(text));
      }
      /**
       * `.text()` can parse Request body of type `text/plain`
       *
       * @see {@link https://hono.dev/docs/api/request#text}
       *
       * @example
       * ```ts
       * app.post('/entry', async (c) => {
       *   const body = await c.req.text()
       * })
       * ```
       */
      text() {
        return this.#cachedBody("text");
      }
      /**
       * `.arrayBuffer()` parse Request body as an `ArrayBuffer`
       *
       * @see {@link https://hono.dev/docs/api/request#arraybuffer}
       *
       * @example
       * ```ts
       * app.post('/entry', async (c) => {
       *   const body = await c.req.arrayBuffer()
       * })
       * ```
       */
      arrayBuffer() {
        return this.#cachedBody("arrayBuffer");
      }
      /**
       * Parses the request body as a `Blob`.
       * @example
       * ```ts
       * app.post('/entry', async (c) => {
       *   const body = await c.req.blob();
       * });
       * ```
       * @see https://hono.dev/docs/api/request#blob
       */
      blob() {
        return this.#cachedBody("blob");
      }
      /**
       * Parses the request body as `FormData`.
       * @example
       * ```ts
       * app.post('/entry', async (c) => {
       *   const body = await c.req.formData();
       * });
       * ```
       * @see https://hono.dev/docs/api/request#formdata
       */
      formData() {
        return this.#cachedBody("formData");
      }
      /**
       * Adds validated data to the request.
       *
       * @param target - The target of the validation.
       * @param data - The validated data to add.
       */
      addValidatedData(target, data) {
        this.#validatedData[target] = data;
      }
      valid(target) {
        return this.#validatedData[target];
      }
      /**
       * `.url()` can get the request url strings.
       *
       * @see {@link https://hono.dev/docs/api/request#url}
       *
       * @example
       * ```ts
       * app.get('/about/me', (c) => {
       *   const url = c.req.url // `http://localhost:8787/about/me`
       *   ...
       * })
       * ```
       */
      get url() {
        return this.raw.url;
      }
      /**
       * `.method()` can get the method name of the request.
       *
       * @see {@link https://hono.dev/docs/api/request#method}
       *
       * @example
       * ```ts
       * app.get('/about/me', (c) => {
       *   const method = c.req.method // `GET`
       * })
       * ```
       */
      get method() {
        return this.raw.method;
      }
      get [GET_MATCH_RESULT]() {
        return this.#matchResult;
      }
      /**
       * `.matchedRoutes()` can return a matched route in the handler
       *
       * @deprecated
       *
       * Use matchedRoutes helper defined in "hono/route" instead.
       *
       * @see {@link https://hono.dev/docs/api/request#matchedroutes}
       *
       * @example
       * ```ts
       * app.use('*', async function logger(c, next) {
       *   await next()
       *   c.req.matchedRoutes.forEach(({ handler, method, path }, i) => {
       *     const name = handler.name || (handler.length < 2 ? '[handler]' : '[middleware]')
       *     console.log(
       *       method,
       *       ' ',
       *       path,
       *       ' '.repeat(Math.max(10 - path.length, 0)),
       *       name,
       *       i === c.req.routeIndex ? '<- respond from here' : ''
       *     )
       *   })
       * })
       * ```
       */
      get matchedRoutes() {
        return this.#matchResult[0].map(([[, route]]) => route);
      }
      /**
       * `routePath()` can retrieve the path registered within the handler
       *
       * @deprecated
       *
       * Use routePath helper defined in "hono/route" instead.
       *
       * @see {@link https://hono.dev/docs/api/request#routepath}
       *
       * @example
       * ```ts
       * app.get('/posts/:id', (c) => {
       *   return c.json({ path: c.req.routePath })
       * })
       * ```
       */
      get routePath() {
        return this.#matchResult[0].map(([[, route]]) => route)[this.routeIndex].path;
      }
    }, "HonoRequest");
  }
});

// ../../node_modules/hono/dist/utils/html.js
var HtmlEscapedCallbackPhase, raw, resolveCallback;
var init_html = __esm({
  "../../node_modules/hono/dist/utils/html.js"() {
    HtmlEscapedCallbackPhase = {
      Stringify: 1,
      BeforeStream: 2,
      Stream: 3
    };
    raw = /* @__PURE__ */ __name((value, callbacks) => {
      const escapedString = new String(value);
      escapedString.isEscaped = true;
      escapedString.callbacks = callbacks;
      return escapedString;
    }, "raw");
    resolveCallback = /* @__PURE__ */ __name(async (str, phase, preserveCallbacks, context, buffer) => {
      if (typeof str === "object" && !(str instanceof String)) {
        if (!(str instanceof Promise)) {
          str = str.toString();
        }
        if (str instanceof Promise) {
          str = await str;
        }
      }
      const callbacks = str.callbacks;
      if (!callbacks?.length) {
        return Promise.resolve(str);
      }
      if (buffer) {
        buffer[0] += str;
      } else {
        buffer = [str];
      }
      const resStr = Promise.all(callbacks.map((c) => c({ phase, buffer, context }))).then(
        (res) => Promise.all(
          res.filter(Boolean).map((str2) => resolveCallback(str2, phase, false, context, buffer))
        ).then(() => buffer[0])
      );
      if (preserveCallbacks) {
        return raw(await resStr, callbacks);
      } else {
        return resStr;
      }
    }, "resolveCallback");
  }
});

// ../../node_modules/hono/dist/context.js
var TEXT_PLAIN, setDefaultContentType, Context;
var init_context = __esm({
  "../../node_modules/hono/dist/context.js"() {
    init_request();
    init_html();
    TEXT_PLAIN = "text/plain; charset=UTF-8";
    setDefaultContentType = /* @__PURE__ */ __name((contentType, headers) => {
      return {
        "Content-Type": contentType,
        ...headers
      };
    }, "setDefaultContentType");
    Context = /* @__PURE__ */ __name(class {
      #rawRequest;
      #req;
      /**
       * `.env` can get bindings (environment variables, secrets, KV namespaces, D1 database, R2 bucket etc.) in Cloudflare Workers.
       *
       * @see {@link https://hono.dev/docs/api/context#env}
       *
       * @example
       * ```ts
       * // Environment object for Cloudflare Workers
       * app.get('*', async c => {
       *   const counter = c.env.COUNTER
       * })
       * ```
       */
      env = {};
      #var;
      finalized = false;
      /**
       * `.error` can get the error object from the middleware if the Handler throws an error.
       *
       * @see {@link https://hono.dev/docs/api/context#error}
       *
       * @example
       * ```ts
       * app.use('*', async (c, next) => {
       *   await next()
       *   if (c.error) {
       *     // do something...
       *   }
       * })
       * ```
       */
      error;
      #status;
      #executionCtx;
      #res;
      #layout;
      #renderer;
      #notFoundHandler;
      #preparedHeaders;
      #matchResult;
      #path;
      /**
       * Creates an instance of the Context class.
       *
       * @param req - The Request object.
       * @param options - Optional configuration options for the context.
       */
      constructor(req, options) {
        this.#rawRequest = req;
        if (options) {
          this.#executionCtx = options.executionCtx;
          this.env = options.env;
          this.#notFoundHandler = options.notFoundHandler;
          this.#path = options.path;
          this.#matchResult = options.matchResult;
        }
      }
      /**
       * `.req` is the instance of {@link HonoRequest}.
       */
      get req() {
        this.#req ??= new HonoRequest(this.#rawRequest, this.#path, this.#matchResult);
        return this.#req;
      }
      /**
       * @see {@link https://hono.dev/docs/api/context#event}
       * The FetchEvent associated with the current request.
       *
       * @throws Will throw an error if the context does not have a FetchEvent.
       */
      get event() {
        if (this.#executionCtx && "respondWith" in this.#executionCtx) {
          return this.#executionCtx;
        } else {
          throw Error("This context has no FetchEvent");
        }
      }
      /**
       * @see {@link https://hono.dev/docs/api/context#executionctx}
       * The ExecutionContext associated with the current request.
       *
       * @throws Will throw an error if the context does not have an ExecutionContext.
       */
      get executionCtx() {
        if (this.#executionCtx) {
          return this.#executionCtx;
        } else {
          throw Error("This context has no ExecutionContext");
        }
      }
      /**
       * @see {@link https://hono.dev/docs/api/context#res}
       * The Response object for the current request.
       */
      get res() {
        return this.#res ||= new Response(null, {
          headers: this.#preparedHeaders ??= new Headers()
        });
      }
      /**
       * Sets the Response object for the current request.
       *
       * @param _res - The Response object to set.
       */
      set res(_res) {
        if (this.#res && _res) {
          _res = new Response(_res.body, _res);
          for (const [k, v] of this.#res.headers.entries()) {
            if (k === "content-type") {
              continue;
            }
            if (k === "set-cookie") {
              const cookies = this.#res.headers.getSetCookie();
              _res.headers.delete("set-cookie");
              for (const cookie of cookies) {
                _res.headers.append("set-cookie", cookie);
              }
            } else {
              _res.headers.set(k, v);
            }
          }
        }
        this.#res = _res;
        this.finalized = true;
      }
      /**
       * `.render()` can create a response within a layout.
       *
       * @see {@link https://hono.dev/docs/api/context#render-setrenderer}
       *
       * @example
       * ```ts
       * app.get('/', (c) => {
       *   return c.render('Hello!')
       * })
       * ```
       */
      render = (...args) => {
        this.#renderer ??= (content) => this.html(content);
        return this.#renderer(...args);
      };
      /**
       * Sets the layout for the response.
       *
       * @param layout - The layout to set.
       * @returns The layout function.
       */
      setLayout = (layout) => this.#layout = layout;
      /**
       * Gets the current layout for the response.
       *
       * @returns The current layout function.
       */
      getLayout = () => this.#layout;
      /**
       * `.setRenderer()` can set the layout in the custom middleware.
       *
       * @see {@link https://hono.dev/docs/api/context#render-setrenderer}
       *
       * @example
       * ```tsx
       * app.use('*', async (c, next) => {
       *   c.setRenderer((content) => {
       *     return c.html(
       *       <html>
       *         <body>
       *           <p>{content}</p>
       *         </body>
       *       </html>
       *     )
       *   })
       *   await next()
       * })
       * ```
       */
      setRenderer = (renderer) => {
        this.#renderer = renderer;
      };
      /**
       * `.header()` can set headers.
       *
       * @see {@link https://hono.dev/docs/api/context#header}
       *
       * @example
       * ```ts
       * app.get('/welcome', (c) => {
       *   // Set headers
       *   c.header('X-Message', 'Hello!')
       *   c.header('Content-Type', 'text/plain')
       *
       *   return c.body('Thank you for coming')
       * })
       * ```
       */
      header = (name, value, options) => {
        if (this.finalized) {
          this.#res = new Response(this.#res.body, this.#res);
        }
        const headers = this.#res ? this.#res.headers : this.#preparedHeaders ??= new Headers();
        if (value === void 0) {
          headers.delete(name);
        } else if (options?.append) {
          headers.append(name, value);
        } else {
          headers.set(name, value);
        }
      };
      status = (status) => {
        this.#status = status;
      };
      /**
       * `.set()` can set the value specified by the key.
       *
       * @see {@link https://hono.dev/docs/api/context#set-get}
       *
       * @example
       * ```ts
       * app.use('*', async (c, next) => {
       *   c.set('message', 'Hono is hot!!')
       *   await next()
       * })
       * ```
       */
      set = (key, value) => {
        this.#var ??= /* @__PURE__ */ new Map();
        this.#var.set(key, value);
      };
      /**
       * `.get()` can use the value specified by the key.
       *
       * @see {@link https://hono.dev/docs/api/context#set-get}
       *
       * @example
       * ```ts
       * app.get('/', (c) => {
       *   const message = c.get('message')
       *   return c.text(`The message is "${message}"`)
       * })
       * ```
       */
      get = (key) => {
        return this.#var ? this.#var.get(key) : void 0;
      };
      /**
       * `.var` can access the value of a variable.
       *
       * @see {@link https://hono.dev/docs/api/context#var}
       *
       * @example
       * ```ts
       * const result = c.var.client.oneMethod()
       * ```
       */
      // c.var.propName is a read-only
      get var() {
        if (!this.#var) {
          return {};
        }
        return Object.fromEntries(this.#var);
      }
      #newResponse(data, arg, headers) {
        const responseHeaders = this.#res ? new Headers(this.#res.headers) : this.#preparedHeaders ?? new Headers();
        if (typeof arg === "object" && "headers" in arg) {
          const argHeaders = arg.headers instanceof Headers ? arg.headers : new Headers(arg.headers);
          for (const [key, value] of argHeaders) {
            if (key.toLowerCase() === "set-cookie") {
              responseHeaders.append(key, value);
            } else {
              responseHeaders.set(key, value);
            }
          }
        }
        if (headers) {
          for (const [k, v] of Object.entries(headers)) {
            if (typeof v === "string") {
              responseHeaders.set(k, v);
            } else {
              responseHeaders.delete(k);
              for (const v2 of v) {
                responseHeaders.append(k, v2);
              }
            }
          }
        }
        const status = typeof arg === "number" ? arg : arg?.status ?? this.#status;
        return new Response(data, { status, headers: responseHeaders });
      }
      newResponse = (...args) => this.#newResponse(...args);
      /**
       * `.body()` can return the HTTP response.
       * You can set headers with `.header()` and set HTTP status code with `.status`.
       * This can also be set in `.text()`, `.json()` and so on.
       *
       * @see {@link https://hono.dev/docs/api/context#body}
       *
       * @example
       * ```ts
       * app.get('/welcome', (c) => {
       *   // Set headers
       *   c.header('X-Message', 'Hello!')
       *   c.header('Content-Type', 'text/plain')
       *   // Set HTTP status code
       *   c.status(201)
       *
       *   // Return the response body
       *   return c.body('Thank you for coming')
       * })
       * ```
       */
      body = (data, arg, headers) => this.#newResponse(data, arg, headers);
      /**
       * `.text()` can render text as `Content-Type:text/plain`.
       *
       * @see {@link https://hono.dev/docs/api/context#text}
       *
       * @example
       * ```ts
       * app.get('/say', (c) => {
       *   return c.text('Hello!')
       * })
       * ```
       */
      text = (text, arg, headers) => {
        return !this.#preparedHeaders && !this.#status && !arg && !headers && !this.finalized ? new Response(text) : this.#newResponse(
          text,
          arg,
          setDefaultContentType(TEXT_PLAIN, headers)
        );
      };
      /**
       * `.json()` can render JSON as `Content-Type:application/json`.
       *
       * @see {@link https://hono.dev/docs/api/context#json}
       *
       * @example
       * ```ts
       * app.get('/api', (c) => {
       *   return c.json({ message: 'Hello!' })
       * })
       * ```
       */
      json = (object, arg, headers) => {
        return this.#newResponse(
          JSON.stringify(object),
          arg,
          setDefaultContentType("application/json", headers)
        );
      };
      html = (html, arg, headers) => {
        const res = /* @__PURE__ */ __name((html2) => this.#newResponse(html2, arg, setDefaultContentType("text/html; charset=UTF-8", headers)), "res");
        return typeof html === "object" ? resolveCallback(html, HtmlEscapedCallbackPhase.Stringify, false, {}).then(res) : res(html);
      };
      /**
       * `.redirect()` can Redirect, default status code is 302.
       *
       * @see {@link https://hono.dev/docs/api/context#redirect}
       *
       * @example
       * ```ts
       * app.get('/redirect', (c) => {
       *   return c.redirect('/')
       * })
       * app.get('/redirect-permanently', (c) => {
       *   return c.redirect('/', 301)
       * })
       * ```
       */
      redirect = (location, status) => {
        const locationString = String(location);
        this.header(
          "Location",
          // Multibyes should be encoded
          // eslint-disable-next-line no-control-regex
          !/[^\x00-\xFF]/.test(locationString) ? locationString : encodeURI(locationString)
        );
        return this.newResponse(null, status ?? 302);
      };
      /**
       * `.notFound()` can return the Not Found Response.
       *
       * @see {@link https://hono.dev/docs/api/context#notfound}
       *
       * @example
       * ```ts
       * app.get('/notfound', (c) => {
       *   return c.notFound()
       * })
       * ```
       */
      notFound = () => {
        this.#notFoundHandler ??= () => new Response();
        return this.#notFoundHandler(this);
      };
    }, "Context");
  }
});

// ../../node_modules/hono/dist/utils/cookie.js
var algorithm, getCryptoKey, verifySignature, validCookieNameRegEx, validCookieValueRegEx, parse, parseSigned;
var init_cookie = __esm({
  "../../node_modules/hono/dist/utils/cookie.js"() {
    init_url();
    algorithm = { name: "HMAC", hash: "SHA-256" };
    getCryptoKey = /* @__PURE__ */ __name(async (secret) => {
      const secretBuf = typeof secret === "string" ? new TextEncoder().encode(secret) : secret;
      return await crypto.subtle.importKey("raw", secretBuf, algorithm, false, ["sign", "verify"]);
    }, "getCryptoKey");
    verifySignature = /* @__PURE__ */ __name(async (base64Signature, value, secret) => {
      try {
        const signatureBinStr = atob(base64Signature);
        const signature = new Uint8Array(signatureBinStr.length);
        for (let i = 0, len = signatureBinStr.length; i < len; i++) {
          signature[i] = signatureBinStr.charCodeAt(i);
        }
        return await crypto.subtle.verify(algorithm, secret, signature, new TextEncoder().encode(value));
      } catch {
        return false;
      }
    }, "verifySignature");
    validCookieNameRegEx = /^[\w!#$%&'*.^`|~+-]+$/;
    validCookieValueRegEx = /^[ !#-:<-[\]-~]*$/;
    parse = /* @__PURE__ */ __name((cookie, name) => {
      if (name && cookie.indexOf(name) === -1) {
        return {};
      }
      const pairs = cookie.trim().split(";");
      const parsedCookie = {};
      for (let pairStr of pairs) {
        pairStr = pairStr.trim();
        const valueStartPos = pairStr.indexOf("=");
        if (valueStartPos === -1) {
          continue;
        }
        const cookieName = pairStr.substring(0, valueStartPos).trim();
        if (name && name !== cookieName || !validCookieNameRegEx.test(cookieName)) {
          continue;
        }
        let cookieValue = pairStr.substring(valueStartPos + 1).trim();
        if (cookieValue.startsWith('"') && cookieValue.endsWith('"')) {
          cookieValue = cookieValue.slice(1, -1);
        }
        if (validCookieValueRegEx.test(cookieValue)) {
          parsedCookie[cookieName] = cookieValue.indexOf("%") !== -1 ? tryDecode(cookieValue, decodeURIComponent_) : cookieValue;
          if (name) {
            break;
          }
        }
      }
      return parsedCookie;
    }, "parse");
    parseSigned = /* @__PURE__ */ __name(async (cookie, secret, name) => {
      const parsedCookie = {};
      const secretKey = await getCryptoKey(secret);
      for (const [key, value] of Object.entries(parse(cookie, name))) {
        const signatureStartPos = value.lastIndexOf(".");
        if (signatureStartPos < 1) {
          continue;
        }
        const signedValue = value.substring(0, signatureStartPos);
        const signature = value.substring(signatureStartPos + 1);
        if (signature.length !== 44 || !signature.endsWith("=")) {
          continue;
        }
        const isVerified = await verifySignature(signature, signedValue, secretKey);
        parsedCookie[key] = isVerified ? signedValue : false;
      }
      return parsedCookie;
    }, "parseSigned");
  }
});

// ../../node_modules/hono/dist/helper/cookie/index.js
var getCookie, getSignedCookie;
var init_cookie2 = __esm({
  "../../node_modules/hono/dist/helper/cookie/index.js"() {
    init_cookie();
    getCookie = /* @__PURE__ */ __name((c, key, prefix) => {
      const cookie = c.req.raw.headers.get("Cookie");
      if (typeof key === "string") {
        if (!cookie) {
          return void 0;
        }
        let finalKey = key;
        if (prefix === "secure") {
          finalKey = "__Secure-" + key;
        } else if (prefix === "host") {
          finalKey = "__Host-" + key;
        }
        const obj2 = parse(cookie, finalKey);
        return obj2[finalKey];
      }
      if (!cookie) {
        return {};
      }
      const obj = parse(cookie);
      return obj;
    }, "getCookie");
    getSignedCookie = /* @__PURE__ */ __name(async (c, secret, key, prefix) => {
      const cookie = c.req.raw.headers.get("Cookie");
      if (typeof key === "string") {
        if (!cookie) {
          return void 0;
        }
        let finalKey = key;
        if (prefix === "secure") {
          finalKey = "__Secure-" + key;
        } else if (prefix === "host") {
          finalKey = "__Host-" + key;
        }
        const obj2 = await parseSigned(cookie, secret, finalKey);
        return obj2[finalKey];
      }
      if (!cookie) {
        return {};
      }
      const obj = await parseSigned(cookie, secret);
      return obj;
    }, "getSignedCookie");
  }
});

// ../../node_modules/hono/dist/utils/encode.js
var decodeBase64Url, encodeBase64Url, encodeBase64, decodeBase64;
var init_encode = __esm({
  "../../node_modules/hono/dist/utils/encode.js"() {
    decodeBase64Url = /* @__PURE__ */ __name((str) => {
      return decodeBase64(str.replace(/_|-/g, (m) => ({ _: "/", "-": "+" })[m] ?? m));
    }, "decodeBase64Url");
    encodeBase64Url = /* @__PURE__ */ __name((buf) => encodeBase64(buf).replace(/\/|\+/g, (m) => ({ "/": "_", "+": "-" })[m] ?? m), "encodeBase64Url");
    encodeBase64 = /* @__PURE__ */ __name((buf) => {
      let binary = "";
      const bytes = new Uint8Array(buf);
      for (let i = 0, len = bytes.length; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    }, "encodeBase64");
    decodeBase64 = /* @__PURE__ */ __name((str) => {
      const binary = atob(str);
      const bytes = new Uint8Array(new ArrayBuffer(binary.length));
      const half = binary.length / 2;
      for (let i = 0, j = binary.length - 1; i <= half; i++, j--) {
        bytes[i] = binary.charCodeAt(i);
        bytes[j] = binary.charCodeAt(j);
      }
      return bytes;
    }, "decodeBase64");
  }
});

// ../../node_modules/hono/dist/utils/jwt/jwa.js
var AlgorithmTypes;
var init_jwa = __esm({
  "../../node_modules/hono/dist/utils/jwt/jwa.js"() {
    AlgorithmTypes = /* @__PURE__ */ ((AlgorithmTypes2) => {
      AlgorithmTypes2["HS256"] = "HS256";
      AlgorithmTypes2["HS384"] = "HS384";
      AlgorithmTypes2["HS512"] = "HS512";
      AlgorithmTypes2["RS256"] = "RS256";
      AlgorithmTypes2["RS384"] = "RS384";
      AlgorithmTypes2["RS512"] = "RS512";
      AlgorithmTypes2["PS256"] = "PS256";
      AlgorithmTypes2["PS384"] = "PS384";
      AlgorithmTypes2["PS512"] = "PS512";
      AlgorithmTypes2["ES256"] = "ES256";
      AlgorithmTypes2["ES384"] = "ES384";
      AlgorithmTypes2["ES512"] = "ES512";
      AlgorithmTypes2["EdDSA"] = "EdDSA";
      return AlgorithmTypes2;
    })(AlgorithmTypes || {});
  }
});

// ../../node_modules/hono/dist/helper/adapter/index.js
var knownUserAgents, getRuntimeKey, checkUserAgentEquals;
var init_adapter = __esm({
  "../../node_modules/hono/dist/helper/adapter/index.js"() {
    knownUserAgents = {
      deno: "Deno",
      bun: "Bun",
      workerd: "Cloudflare-Workers",
      node: "Node.js"
    };
    getRuntimeKey = /* @__PURE__ */ __name(() => {
      const global = globalThis;
      const userAgentSupported = typeof navigator !== "undefined" && true;
      if (userAgentSupported) {
        for (const [runtimeKey, userAgent] of Object.entries(knownUserAgents)) {
          if (checkUserAgentEquals(userAgent)) {
            return runtimeKey;
          }
        }
      }
      if (typeof global?.EdgeRuntime === "string") {
        return "edge-light";
      }
      if (global?.fastly !== void 0) {
        return "fastly";
      }
      if (global?.process?.release?.name === "node") {
        return "node";
      }
      return "other";
    }, "getRuntimeKey");
    checkUserAgentEquals = /* @__PURE__ */ __name((platform) => {
      const userAgent = "Cloudflare-Workers";
      return userAgent.startsWith(platform);
    }, "checkUserAgentEquals");
  }
});

// ../../node_modules/hono/dist/utils/jwt/types.js
var JwtAlgorithmNotImplemented, JwtAlgorithmRequired, JwtAlgorithmMismatch, JwtTokenInvalid, JwtTokenNotBefore, JwtTokenExpired, JwtTokenIssuedAt, JwtTokenIssuer, JwtHeaderInvalid, JwtHeaderRequiresKid, JwtSymmetricAlgorithmNotAllowed, JwtAlgorithmNotAllowed, JwtTokenSignatureMismatched, JwtPayloadRequiresAud, JwtTokenAudience, CryptoKeyUsage;
var init_types = __esm({
  "../../node_modules/hono/dist/utils/jwt/types.js"() {
    JwtAlgorithmNotImplemented = /* @__PURE__ */ __name(class extends Error {
      constructor(alg) {
        super(`${alg} is not an implemented algorithm`);
        this.name = "JwtAlgorithmNotImplemented";
      }
    }, "JwtAlgorithmNotImplemented");
    JwtAlgorithmRequired = /* @__PURE__ */ __name(class extends Error {
      constructor() {
        super('JWT verification requires "alg" option to be specified');
        this.name = "JwtAlgorithmRequired";
      }
    }, "JwtAlgorithmRequired");
    JwtAlgorithmMismatch = /* @__PURE__ */ __name(class extends Error {
      constructor(expected, actual) {
        super(`JWT algorithm mismatch: expected "${expected}", got "${actual}"`);
        this.name = "JwtAlgorithmMismatch";
      }
    }, "JwtAlgorithmMismatch");
    JwtTokenInvalid = /* @__PURE__ */ __name(class extends Error {
      constructor(token) {
        super(`invalid JWT token: ${token}`);
        this.name = "JwtTokenInvalid";
      }
    }, "JwtTokenInvalid");
    JwtTokenNotBefore = /* @__PURE__ */ __name(class extends Error {
      constructor(token) {
        super(`token (${token}) is being used before it's valid`);
        this.name = "JwtTokenNotBefore";
      }
    }, "JwtTokenNotBefore");
    JwtTokenExpired = /* @__PURE__ */ __name(class extends Error {
      constructor(token) {
        super(`token (${token}) expired`);
        this.name = "JwtTokenExpired";
      }
    }, "JwtTokenExpired");
    JwtTokenIssuedAt = /* @__PURE__ */ __name(class extends Error {
      constructor(currentTimestamp, iat) {
        super(
          `Invalid "iat" claim, must be a valid number lower than "${currentTimestamp}" (iat: "${iat}")`
        );
        this.name = "JwtTokenIssuedAt";
      }
    }, "JwtTokenIssuedAt");
    JwtTokenIssuer = /* @__PURE__ */ __name(class extends Error {
      constructor(expected, iss) {
        super(`expected issuer "${expected}", got ${iss ? `"${iss}"` : "none"} `);
        this.name = "JwtTokenIssuer";
      }
    }, "JwtTokenIssuer");
    JwtHeaderInvalid = /* @__PURE__ */ __name(class extends Error {
      constructor(header) {
        super(`jwt header is invalid: ${JSON.stringify(header)}`);
        this.name = "JwtHeaderInvalid";
      }
    }, "JwtHeaderInvalid");
    JwtHeaderRequiresKid = /* @__PURE__ */ __name(class extends Error {
      constructor(header) {
        super(`required "kid" in jwt header: ${JSON.stringify(header)}`);
        this.name = "JwtHeaderRequiresKid";
      }
    }, "JwtHeaderRequiresKid");
    JwtSymmetricAlgorithmNotAllowed = /* @__PURE__ */ __name(class extends Error {
      constructor(alg) {
        super(`symmetric algorithm "${alg}" is not allowed for JWK verification`);
        this.name = "JwtSymmetricAlgorithmNotAllowed";
      }
    }, "JwtSymmetricAlgorithmNotAllowed");
    JwtAlgorithmNotAllowed = /* @__PURE__ */ __name(class extends Error {
      constructor(alg, allowedAlgorithms) {
        super(`algorithm "${alg}" is not in the allowed list: [${allowedAlgorithms.join(", ")}]`);
        this.name = "JwtAlgorithmNotAllowed";
      }
    }, "JwtAlgorithmNotAllowed");
    JwtTokenSignatureMismatched = /* @__PURE__ */ __name(class extends Error {
      constructor(token) {
        super(`token(${token}) signature mismatched`);
        this.name = "JwtTokenSignatureMismatched";
      }
    }, "JwtTokenSignatureMismatched");
    JwtPayloadRequiresAud = /* @__PURE__ */ __name(class extends Error {
      constructor(payload) {
        super(`required "aud" in jwt payload: ${JSON.stringify(payload)}`);
        this.name = "JwtPayloadRequiresAud";
      }
    }, "JwtPayloadRequiresAud");
    JwtTokenAudience = /* @__PURE__ */ __name(class extends Error {
      constructor(expected, aud) {
        super(
          `expected audience "${Array.isArray(expected) ? expected.join(", ") : expected}", got "${aud}"`
        );
        this.name = "JwtTokenAudience";
      }
    }, "JwtTokenAudience");
    CryptoKeyUsage = /* @__PURE__ */ ((CryptoKeyUsage2) => {
      CryptoKeyUsage2["Encrypt"] = "encrypt";
      CryptoKeyUsage2["Decrypt"] = "decrypt";
      CryptoKeyUsage2["Sign"] = "sign";
      CryptoKeyUsage2["Verify"] = "verify";
      CryptoKeyUsage2["DeriveKey"] = "deriveKey";
      CryptoKeyUsage2["DeriveBits"] = "deriveBits";
      CryptoKeyUsage2["WrapKey"] = "wrapKey";
      CryptoKeyUsage2["UnwrapKey"] = "unwrapKey";
      return CryptoKeyUsage2;
    })(CryptoKeyUsage || {});
  }
});

// ../../node_modules/hono/dist/utils/jwt/utf8.js
var utf8Encoder, utf8Decoder;
var init_utf8 = __esm({
  "../../node_modules/hono/dist/utils/jwt/utf8.js"() {
    utf8Encoder = new TextEncoder();
    utf8Decoder = new TextDecoder();
  }
});

// ../../node_modules/hono/dist/utils/jwt/jws.js
async function signing(privateKey, alg, data) {
  const algorithm2 = getKeyAlgorithm(alg);
  const cryptoKey = await importPrivateKey(privateKey, algorithm2);
  return await crypto.subtle.sign(algorithm2, cryptoKey, data);
}
async function verifying(publicKey, alg, signature, data) {
  const algorithm2 = getKeyAlgorithm(alg);
  const cryptoKey = await importPublicKey(publicKey, algorithm2);
  return await crypto.subtle.verify(algorithm2, cryptoKey, signature, data);
}
function pemToBinary(pem) {
  return decodeBase64(pem.replace(/-+(BEGIN|END).*/g, "").replace(/\s/g, ""));
}
async function importPrivateKey(key, alg) {
  if (!crypto.subtle || !crypto.subtle.importKey) {
    throw new Error("`crypto.subtle.importKey` is undefined. JWT auth middleware requires it.");
  }
  if (isCryptoKey(key)) {
    if (key.type !== "private" && key.type !== "secret") {
      throw new Error(
        `unexpected key type: CryptoKey.type is ${key.type}, expected private or secret`
      );
    }
    return key;
  }
  const usages = [CryptoKeyUsage.Sign];
  if (typeof key === "object") {
    return await crypto.subtle.importKey("jwk", key, alg, false, usages);
  }
  if (key.includes("PRIVATE")) {
    return await crypto.subtle.importKey("pkcs8", pemToBinary(key), alg, false, usages);
  }
  return await crypto.subtle.importKey("raw", utf8Encoder.encode(key), alg, false, usages);
}
async function importPublicKey(key, alg) {
  if (!crypto.subtle || !crypto.subtle.importKey) {
    throw new Error("`crypto.subtle.importKey` is undefined. JWT auth middleware requires it.");
  }
  if (isCryptoKey(key)) {
    if (key.type === "public" || key.type === "secret") {
      return key;
    }
    key = await exportPublicJwkFrom(key);
  }
  if (typeof key === "string" && key.includes("PRIVATE")) {
    const privateKey = await crypto.subtle.importKey("pkcs8", pemToBinary(key), alg, true, [
      CryptoKeyUsage.Sign
    ]);
    key = await exportPublicJwkFrom(privateKey);
  }
  const usages = [CryptoKeyUsage.Verify];
  if (typeof key === "object") {
    return await crypto.subtle.importKey("jwk", key, alg, false, usages);
  }
  if (key.includes("PUBLIC")) {
    return await crypto.subtle.importKey("spki", pemToBinary(key), alg, false, usages);
  }
  return await crypto.subtle.importKey("raw", utf8Encoder.encode(key), alg, false, usages);
}
async function exportPublicJwkFrom(privateKey) {
  if (privateKey.type !== "private") {
    throw new Error(`unexpected key type: ${privateKey.type}`);
  }
  if (!privateKey.extractable) {
    throw new Error("unexpected private key is unextractable");
  }
  const jwk = await crypto.subtle.exportKey("jwk", privateKey);
  const { kty } = jwk;
  const { alg, e, n } = jwk;
  const { crv, x, y } = jwk;
  return { kty, alg, e, n, crv, x, y, key_ops: [CryptoKeyUsage.Verify] };
}
function getKeyAlgorithm(name) {
  switch (name) {
    case "HS256":
      return {
        name: "HMAC",
        hash: {
          name: "SHA-256"
        }
      };
    case "HS384":
      return {
        name: "HMAC",
        hash: {
          name: "SHA-384"
        }
      };
    case "HS512":
      return {
        name: "HMAC",
        hash: {
          name: "SHA-512"
        }
      };
    case "RS256":
      return {
        name: "RSASSA-PKCS1-v1_5",
        hash: {
          name: "SHA-256"
        }
      };
    case "RS384":
      return {
        name: "RSASSA-PKCS1-v1_5",
        hash: {
          name: "SHA-384"
        }
      };
    case "RS512":
      return {
        name: "RSASSA-PKCS1-v1_5",
        hash: {
          name: "SHA-512"
        }
      };
    case "PS256":
      return {
        name: "RSA-PSS",
        hash: {
          name: "SHA-256"
        },
        saltLength: 32
        // 256 >> 3
      };
    case "PS384":
      return {
        name: "RSA-PSS",
        hash: {
          name: "SHA-384"
        },
        saltLength: 48
        // 384 >> 3
      };
    case "PS512":
      return {
        name: "RSA-PSS",
        hash: {
          name: "SHA-512"
        },
        saltLength: 64
        // 512 >> 3,
      };
    case "ES256":
      return {
        name: "ECDSA",
        hash: {
          name: "SHA-256"
        },
        namedCurve: "P-256"
      };
    case "ES384":
      return {
        name: "ECDSA",
        hash: {
          name: "SHA-384"
        },
        namedCurve: "P-384"
      };
    case "ES512":
      return {
        name: "ECDSA",
        hash: {
          name: "SHA-512"
        },
        namedCurve: "P-521"
      };
    case "EdDSA":
      return {
        name: "Ed25519",
        namedCurve: "Ed25519"
      };
    default:
      throw new JwtAlgorithmNotImplemented(name);
  }
}
function isCryptoKey(key) {
  const runtime = getRuntimeKey();
  if (runtime === "node" && !!crypto.webcrypto) {
    return key instanceof crypto.webcrypto.CryptoKey;
  }
  return key instanceof CryptoKey;
}
var init_jws = __esm({
  "../../node_modules/hono/dist/utils/jwt/jws.js"() {
    init_adapter();
    init_encode();
    init_types();
    init_utf8();
    __name(signing, "signing");
    __name(verifying, "verifying");
    __name(pemToBinary, "pemToBinary");
    __name(importPrivateKey, "importPrivateKey");
    __name(importPublicKey, "importPublicKey");
    __name(exportPublicJwkFrom, "exportPublicJwkFrom");
    __name(getKeyAlgorithm, "getKeyAlgorithm");
    __name(isCryptoKey, "isCryptoKey");
  }
});

// ../../node_modules/hono/dist/utils/jwt/jwt.js
function isTokenHeader(obj) {
  if (typeof obj === "object" && obj !== null) {
    const objWithAlg = obj;
    return "alg" in objWithAlg && Object.values(AlgorithmTypes).includes(objWithAlg.alg) && (!("typ" in objWithAlg) || objWithAlg.typ === "JWT");
  }
  return false;
}
var encodeJwtPart, encodeSignaturePart, decodeJwtPart, sign, verify, symmetricAlgorithms, verifyWithJwks, decode, decodeHeader;
var init_jwt = __esm({
  "../../node_modules/hono/dist/utils/jwt/jwt.js"() {
    init_encode();
    init_jwa();
    init_jws();
    init_types();
    init_utf8();
    encodeJwtPart = /* @__PURE__ */ __name((part) => encodeBase64Url(utf8Encoder.encode(JSON.stringify(part)).buffer).replace(/=/g, ""), "encodeJwtPart");
    encodeSignaturePart = /* @__PURE__ */ __name((buf) => encodeBase64Url(buf).replace(/=/g, ""), "encodeSignaturePart");
    decodeJwtPart = /* @__PURE__ */ __name((part) => JSON.parse(utf8Decoder.decode(decodeBase64Url(part))), "decodeJwtPart");
    __name(isTokenHeader, "isTokenHeader");
    sign = /* @__PURE__ */ __name(async (payload, privateKey, alg = "HS256") => {
      const encodedPayload = encodeJwtPart(payload);
      let encodedHeader;
      if (typeof privateKey === "object" && "alg" in privateKey) {
        alg = privateKey.alg;
        encodedHeader = encodeJwtPart({ alg, typ: "JWT", kid: privateKey.kid });
      } else {
        encodedHeader = encodeJwtPart({ alg, typ: "JWT" });
      }
      const partialToken = `${encodedHeader}.${encodedPayload}`;
      const signaturePart = await signing(privateKey, alg, utf8Encoder.encode(partialToken));
      const signature = encodeSignaturePart(signaturePart);
      return `${partialToken}.${signature}`;
    }, "sign");
    verify = /* @__PURE__ */ __name(async (token, publicKey, algOrOptions) => {
      if (!algOrOptions) {
        throw new JwtAlgorithmRequired();
      }
      const {
        alg,
        iss,
        nbf = true,
        exp = true,
        iat = true,
        aud
      } = typeof algOrOptions === "string" ? { alg: algOrOptions } : algOrOptions;
      if (!alg) {
        throw new JwtAlgorithmRequired();
      }
      const tokenParts = token.split(".");
      if (tokenParts.length !== 3) {
        throw new JwtTokenInvalid(token);
      }
      const { header, payload } = decode(token);
      if (!isTokenHeader(header)) {
        throw new JwtHeaderInvalid(header);
      }
      if (header.alg !== alg) {
        throw new JwtAlgorithmMismatch(alg, header.alg);
      }
      const now = Date.now() / 1e3 | 0;
      if (nbf && payload.nbf && payload.nbf > now) {
        throw new JwtTokenNotBefore(token);
      }
      if (exp && payload.exp && payload.exp <= now) {
        throw new JwtTokenExpired(token);
      }
      if (iat && payload.iat && now < payload.iat) {
        throw new JwtTokenIssuedAt(now, payload.iat);
      }
      if (iss) {
        if (!payload.iss) {
          throw new JwtTokenIssuer(iss, null);
        }
        if (typeof iss === "string" && payload.iss !== iss) {
          throw new JwtTokenIssuer(iss, payload.iss);
        }
        if (iss instanceof RegExp && !iss.test(payload.iss)) {
          throw new JwtTokenIssuer(iss, payload.iss);
        }
      }
      if (aud) {
        if (!payload.aud) {
          throw new JwtPayloadRequiresAud(payload);
        }
        const audiences = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
        const matched = audiences.some(
          (payloadAud) => aud instanceof RegExp ? aud.test(payloadAud) : typeof aud === "string" ? payloadAud === aud : Array.isArray(aud) && aud.includes(payloadAud)
        );
        if (!matched) {
          throw new JwtTokenAudience(aud, payload.aud);
        }
      }
      const headerPayload = token.substring(0, token.lastIndexOf("."));
      const verified = await verifying(
        publicKey,
        alg,
        decodeBase64Url(tokenParts[2]),
        utf8Encoder.encode(headerPayload)
      );
      if (!verified) {
        throw new JwtTokenSignatureMismatched(token);
      }
      return payload;
    }, "verify");
    symmetricAlgorithms = [
      AlgorithmTypes.HS256,
      AlgorithmTypes.HS384,
      AlgorithmTypes.HS512
    ];
    verifyWithJwks = /* @__PURE__ */ __name(async (token, options, init) => {
      const verifyOpts = options.verification || {};
      const header = decodeHeader(token);
      if (!isTokenHeader(header)) {
        throw new JwtHeaderInvalid(header);
      }
      if (!header.kid) {
        throw new JwtHeaderRequiresKid(header);
      }
      if (symmetricAlgorithms.includes(header.alg)) {
        throw new JwtSymmetricAlgorithmNotAllowed(header.alg);
      }
      if (!options.allowedAlgorithms.includes(header.alg)) {
        throw new JwtAlgorithmNotAllowed(header.alg, options.allowedAlgorithms);
      }
      if (options.jwks_uri) {
        const response = await fetch(options.jwks_uri, init);
        if (!response.ok) {
          throw new Error(`failed to fetch JWKS from ${options.jwks_uri}`);
        }
        const data = await response.json();
        if (!data.keys) {
          throw new Error('invalid JWKS response. "keys" field is missing');
        }
        if (!Array.isArray(data.keys)) {
          throw new Error('invalid JWKS response. "keys" field is not an array');
        }
        if (options.keys) {
          options.keys.push(...data.keys);
        } else {
          options.keys = data.keys;
        }
      } else if (!options.keys) {
        throw new Error('verifyWithJwks requires options for either "keys" or "jwks_uri" or both');
      }
      const matchingKey = options.keys.find((key) => key.kid === header.kid);
      if (!matchingKey) {
        throw new JwtTokenInvalid(token);
      }
      if (matchingKey.alg && matchingKey.alg !== header.alg) {
        throw new JwtAlgorithmMismatch(matchingKey.alg, header.alg);
      }
      return await verify(token, matchingKey, {
        alg: header.alg,
        ...verifyOpts
      });
    }, "verifyWithJwks");
    decode = /* @__PURE__ */ __name((token) => {
      try {
        const [h, p] = token.split(".");
        const header = decodeJwtPart(h);
        const payload = decodeJwtPart(p);
        return {
          header,
          payload
        };
      } catch {
        throw new JwtTokenInvalid(token);
      }
    }, "decode");
    decodeHeader = /* @__PURE__ */ __name((token) => {
      try {
        const [h] = token.split(".");
        return decodeJwtPart(h);
      } catch {
        throw new JwtTokenInvalid(token);
      }
    }, "decodeHeader");
  }
});

// ../../node_modules/hono/dist/utils/jwt/index.js
var Jwt;
var init_jwt2 = __esm({
  "../../node_modules/hono/dist/utils/jwt/index.js"() {
    init_jwt();
    Jwt = { sign, verify, decode, verifyWithJwks };
  }
});

// ../../node_modules/hono/dist/middleware/jwt/jwt.js
function unauthorizedResponse(opts) {
  return new Response("Unauthorized", {
    status: 401,
    statusText: opts.statusText,
    headers: {
      "WWW-Authenticate": `Bearer realm="${opts.ctx.req.url}",error="${opts.error}",error_description="${opts.errDescription}"`
    }
  });
}
var jwt, verifyWithJwks2, verify2, decode2, sign2;
var init_jwt3 = __esm({
  "../../node_modules/hono/dist/middleware/jwt/jwt.js"() {
    init_cookie2();
    init_http_exception();
    init_jwt2();
    init_context();
    jwt = /* @__PURE__ */ __name((options) => {
      const verifyOpts = options.verification || {};
      if (!options || !options.secret) {
        throw new Error('JWT auth middleware requires options for "secret"');
      }
      if (!options.alg) {
        throw new Error('JWT auth middleware requires options for "alg"');
      }
      if (!crypto.subtle || !crypto.subtle.importKey) {
        throw new Error("`crypto.subtle.importKey` is undefined. JWT auth middleware requires it.");
      }
      return /* @__PURE__ */ __name(async function jwt2(ctx, next) {
        const headerName = options.headerName || "Authorization";
        const credentials = ctx.req.raw.headers.get(headerName);
        let token;
        if (credentials) {
          const parts = credentials.split(/\s+/);
          if (parts.length !== 2) {
            const errDescription = "invalid credentials structure";
            throw new HTTPException(401, {
              message: errDescription,
              res: unauthorizedResponse({
                ctx,
                error: "invalid_request",
                errDescription
              })
            });
          } else {
            token = parts[1];
          }
        } else if (options.cookie) {
          if (typeof options.cookie == "string") {
            token = getCookie(ctx, options.cookie);
          } else if (options.cookie.secret) {
            if (options.cookie.prefixOptions) {
              token = await getSignedCookie(
                ctx,
                options.cookie.secret,
                options.cookie.key,
                options.cookie.prefixOptions
              );
            } else {
              token = await getSignedCookie(ctx, options.cookie.secret, options.cookie.key);
            }
          } else {
            if (options.cookie.prefixOptions) {
              token = getCookie(ctx, options.cookie.key, options.cookie.prefixOptions);
            } else {
              token = getCookie(ctx, options.cookie.key);
            }
          }
        }
        if (!token) {
          const errDescription = "no authorization included in request";
          throw new HTTPException(401, {
            message: errDescription,
            res: unauthorizedResponse({
              ctx,
              error: "invalid_request",
              errDescription
            })
          });
        }
        let payload;
        let cause;
        try {
          payload = await Jwt.verify(token, options.secret, {
            alg: options.alg,
            ...verifyOpts
          });
        } catch (e) {
          cause = e;
        }
        if (!payload) {
          throw new HTTPException(401, {
            message: "Unauthorized",
            res: unauthorizedResponse({
              ctx,
              error: "invalid_token",
              statusText: "Unauthorized",
              errDescription: "token verification failure"
            }),
            cause
          });
        }
        ctx.set("jwtPayload", payload);
        await next();
      }, "jwt2");
    }, "jwt");
    __name(unauthorizedResponse, "unauthorizedResponse");
    verifyWithJwks2 = Jwt.verifyWithJwks;
    verify2 = Jwt.verify;
    decode2 = Jwt.decode;
    sign2 = Jwt.sign;
  }
});

// ../../node_modules/hono/dist/middleware/jwt/index.js
var jwt_exports = {};
__export(jwt_exports, {
  AlgorithmTypes: () => AlgorithmTypes,
  decode: () => decode2,
  jwt: () => jwt,
  sign: () => sign2,
  verify: () => verify2,
  verifyWithJwks: () => verifyWithJwks2
});
var init_jwt4 = __esm({
  "../../node_modules/hono/dist/middleware/jwt/index.js"() {
    init_jwt3();
    init_jwa();
  }
});

// ../../node_modules/hono/dist/compose.js
var compose = /* @__PURE__ */ __name((middleware, onError, onNotFound) => {
  return (context, next) => {
    let index = -1;
    return dispatch(0);
    async function dispatch(i) {
      if (i <= index) {
        throw new Error("next() called multiple times");
      }
      index = i;
      let res;
      let isError = false;
      let handler;
      if (middleware[i]) {
        handler = middleware[i][0][0];
        context.req.routeIndex = i;
      } else {
        handler = i === middleware.length && next || void 0;
      }
      if (handler) {
        try {
          res = await handler(context, () => dispatch(i + 1));
        } catch (err) {
          if (err instanceof Error && onError) {
            context.error = err;
            res = await onError(err, context);
            isError = true;
          } else {
            throw err;
          }
        }
      } else {
        if (context.finalized === false && onNotFound) {
          res = await onNotFound(context);
        }
      }
      if (res && (context.finalized === false || isError)) {
        context.res = res;
      }
      return context;
    }
    __name(dispatch, "dispatch");
  };
}, "compose");

// ../../node_modules/hono/dist/hono-base.js
init_context();

// ../../node_modules/hono/dist/router.js
var METHOD_NAME_ALL = "ALL";
var METHOD_NAME_ALL_LOWERCASE = "all";
var METHODS = ["get", "post", "put", "delete", "options", "patch"];
var MESSAGE_MATCHER_IS_ALREADY_BUILT = "Can not add a route since the matcher is already built.";
var UnsupportedPathError = /* @__PURE__ */ __name(class extends Error {
}, "UnsupportedPathError");

// ../../node_modules/hono/dist/utils/constants.js
var COMPOSED_HANDLER = "__COMPOSED_HANDLER";

// ../../node_modules/hono/dist/hono-base.js
init_url();
var notFoundHandler = /* @__PURE__ */ __name((c) => {
  return c.text("404 Not Found", 404);
}, "notFoundHandler");
var errorHandler = /* @__PURE__ */ __name((err, c) => {
  if ("getResponse" in err) {
    const res = err.getResponse();
    return c.newResponse(res.body, res);
  }
  console.error(err);
  return c.text("Internal Server Error", 500);
}, "errorHandler");
var Hono = /* @__PURE__ */ __name(class _Hono {
  get;
  post;
  put;
  delete;
  options;
  patch;
  all;
  on;
  use;
  /*
    This class is like an abstract class and does not have a router.
    To use it, inherit the class and implement router in the constructor.
  */
  router;
  getPath;
  // Cannot use `#` because it requires visibility at JavaScript runtime.
  _basePath = "/";
  #path = "/";
  routes = [];
  constructor(options = {}) {
    const allMethods = [...METHODS, METHOD_NAME_ALL_LOWERCASE];
    allMethods.forEach((method) => {
      this[method] = (args1, ...args) => {
        if (typeof args1 === "string") {
          this.#path = args1;
        } else {
          this.#addRoute(method, this.#path, args1);
        }
        args.forEach((handler) => {
          this.#addRoute(method, this.#path, handler);
        });
        return this;
      };
    });
    this.on = (method, path, ...handlers) => {
      for (const p of [path].flat()) {
        this.#path = p;
        for (const m of [method].flat()) {
          handlers.map((handler) => {
            this.#addRoute(m.toUpperCase(), this.#path, handler);
          });
        }
      }
      return this;
    };
    this.use = (arg1, ...handlers) => {
      if (typeof arg1 === "string") {
        this.#path = arg1;
      } else {
        this.#path = "*";
        handlers.unshift(arg1);
      }
      handlers.forEach((handler) => {
        this.#addRoute(METHOD_NAME_ALL, this.#path, handler);
      });
      return this;
    };
    const { strict, ...optionsWithoutStrict } = options;
    Object.assign(this, optionsWithoutStrict);
    this.getPath = strict ?? true ? options.getPath ?? getPath : getPathNoStrict;
  }
  #clone() {
    const clone = new _Hono({
      router: this.router,
      getPath: this.getPath
    });
    clone.errorHandler = this.errorHandler;
    clone.#notFoundHandler = this.#notFoundHandler;
    clone.routes = this.routes;
    return clone;
  }
  #notFoundHandler = notFoundHandler;
  // Cannot use `#` because it requires visibility at JavaScript runtime.
  errorHandler = errorHandler;
  /**
   * `.route()` allows grouping other Hono instance in routes.
   *
   * @see {@link https://hono.dev/docs/api/routing#grouping}
   *
   * @param {string} path - base Path
   * @param {Hono} app - other Hono instance
   * @returns {Hono} routed Hono instance
   *
   * @example
   * ```ts
   * const app = new Hono()
   * const app2 = new Hono()
   *
   * app2.get("/user", (c) => c.text("user"))
   * app.route("/api", app2) // GET /api/user
   * ```
   */
  route(path, app2) {
    const subApp = this.basePath(path);
    app2.routes.map((r) => {
      let handler;
      if (app2.errorHandler === errorHandler) {
        handler = r.handler;
      } else {
        handler = /* @__PURE__ */ __name(async (c, next) => (await compose([], app2.errorHandler)(c, () => r.handler(c, next))).res, "handler");
        handler[COMPOSED_HANDLER] = r.handler;
      }
      subApp.#addRoute(r.method, r.path, handler);
    });
    return this;
  }
  /**
   * `.basePath()` allows base paths to be specified.
   *
   * @see {@link https://hono.dev/docs/api/routing#base-path}
   *
   * @param {string} path - base Path
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * const api = new Hono().basePath('/api')
   * ```
   */
  basePath(path) {
    const subApp = this.#clone();
    subApp._basePath = mergePath(this._basePath, path);
    return subApp;
  }
  /**
   * `.onError()` handles an error and returns a customized Response.
   *
   * @see {@link https://hono.dev/docs/api/hono#error-handling}
   *
   * @param {ErrorHandler} handler - request Handler for error
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * app.onError((err, c) => {
   *   console.error(`${err}`)
   *   return c.text('Custom Error Message', 500)
   * })
   * ```
   */
  onError = (handler) => {
    this.errorHandler = handler;
    return this;
  };
  /**
   * `.notFound()` allows you to customize a Not Found Response.
   *
   * @see {@link https://hono.dev/docs/api/hono#not-found}
   *
   * @param {NotFoundHandler} handler - request handler for not-found
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * app.notFound((c) => {
   *   return c.text('Custom 404 Message', 404)
   * })
   * ```
   */
  notFound = (handler) => {
    this.#notFoundHandler = handler;
    return this;
  };
  /**
   * `.mount()` allows you to mount applications built with other frameworks into your Hono application.
   *
   * @see {@link https://hono.dev/docs/api/hono#mount}
   *
   * @param {string} path - base Path
   * @param {Function} applicationHandler - other Request Handler
   * @param {MountOptions} [options] - options of `.mount()`
   * @returns {Hono} mounted Hono instance
   *
   * @example
   * ```ts
   * import { Router as IttyRouter } from 'itty-router'
   * import { Hono } from 'hono'
   * // Create itty-router application
   * const ittyRouter = IttyRouter()
   * // GET /itty-router/hello
   * ittyRouter.get('/hello', () => new Response('Hello from itty-router'))
   *
   * const app = new Hono()
   * app.mount('/itty-router', ittyRouter.handle)
   * ```
   *
   * @example
   * ```ts
   * const app = new Hono()
   * // Send the request to another application without modification.
   * app.mount('/app', anotherApp, {
   *   replaceRequest: (req) => req,
   * })
   * ```
   */
  mount(path, applicationHandler, options) {
    let replaceRequest;
    let optionHandler;
    if (options) {
      if (typeof options === "function") {
        optionHandler = options;
      } else {
        optionHandler = options.optionHandler;
        if (options.replaceRequest === false) {
          replaceRequest = /* @__PURE__ */ __name((request) => request, "replaceRequest");
        } else {
          replaceRequest = options.replaceRequest;
        }
      }
    }
    const getOptions = optionHandler ? (c) => {
      const options2 = optionHandler(c);
      return Array.isArray(options2) ? options2 : [options2];
    } : (c) => {
      let executionContext = void 0;
      try {
        executionContext = c.executionCtx;
      } catch {
      }
      return [c.env, executionContext];
    };
    replaceRequest ||= (() => {
      const mergedPath = mergePath(this._basePath, path);
      const pathPrefixLength = mergedPath === "/" ? 0 : mergedPath.length;
      return (request) => {
        const url = new URL(request.url);
        url.pathname = url.pathname.slice(pathPrefixLength) || "/";
        return new Request(url, request);
      };
    })();
    const handler = /* @__PURE__ */ __name(async (c, next) => {
      const res = await applicationHandler(replaceRequest(c.req.raw), ...getOptions(c));
      if (res) {
        return res;
      }
      await next();
    }, "handler");
    this.#addRoute(METHOD_NAME_ALL, mergePath(path, "*"), handler);
    return this;
  }
  #addRoute(method, path, handler) {
    method = method.toUpperCase();
    path = mergePath(this._basePath, path);
    const r = { basePath: this._basePath, path, method, handler };
    this.router.add(method, path, [handler, r]);
    this.routes.push(r);
  }
  #handleError(err, c) {
    if (err instanceof Error) {
      return this.errorHandler(err, c);
    }
    throw err;
  }
  #dispatch(request, executionCtx, env, method) {
    if (method === "HEAD") {
      return (async () => new Response(null, await this.#dispatch(request, executionCtx, env, "GET")))();
    }
    const path = this.getPath(request, { env });
    const matchResult = this.router.match(method, path);
    const c = new Context(request, {
      path,
      matchResult,
      env,
      executionCtx,
      notFoundHandler: this.#notFoundHandler
    });
    if (matchResult[0].length === 1) {
      let res;
      try {
        res = matchResult[0][0][0][0](c, async () => {
          c.res = await this.#notFoundHandler(c);
        });
      } catch (err) {
        return this.#handleError(err, c);
      }
      return res instanceof Promise ? res.then(
        (resolved) => resolved || (c.finalized ? c.res : this.#notFoundHandler(c))
      ).catch((err) => this.#handleError(err, c)) : res ?? this.#notFoundHandler(c);
    }
    const composed = compose(matchResult[0], this.errorHandler, this.#notFoundHandler);
    return (async () => {
      try {
        const context = await composed(c);
        if (!context.finalized) {
          throw new Error(
            "Context is not finalized. Did you forget to return a Response object or `await next()`?"
          );
        }
        return context.res;
      } catch (err) {
        return this.#handleError(err, c);
      }
    })();
  }
  /**
   * `.fetch()` will be entry point of your app.
   *
   * @see {@link https://hono.dev/docs/api/hono#fetch}
   *
   * @param {Request} request - request Object of request
   * @param {Env} Env - env Object
   * @param {ExecutionContext} - context of execution
   * @returns {Response | Promise<Response>} response of request
   *
   */
  fetch = (request, ...rest) => {
    return this.#dispatch(request, rest[1], rest[0], request.method);
  };
  /**
   * `.request()` is a useful method for testing.
   * You can pass a URL or pathname to send a GET request.
   * app will return a Response object.
   * ```ts
   * test('GET /hello is ok', async () => {
   *   const res = await app.request('/hello')
   *   expect(res.status).toBe(200)
   * })
   * ```
   * @see https://hono.dev/docs/api/hono#request
   */
  request = (input, requestInit, Env, executionCtx) => {
    if (input instanceof Request) {
      return this.fetch(requestInit ? new Request(input, requestInit) : input, Env, executionCtx);
    }
    input = input.toString();
    return this.fetch(
      new Request(
        /^https?:\/\//.test(input) ? input : `http://localhost${mergePath("/", input)}`,
        requestInit
      ),
      Env,
      executionCtx
    );
  };
  /**
   * `.fire()` automatically adds a global fetch event listener.
   * This can be useful for environments that adhere to the Service Worker API, such as non-ES module Cloudflare Workers.
   * @deprecated
   * Use `fire` from `hono/service-worker` instead.
   * ```ts
   * import { Hono } from 'hono'
   * import { fire } from 'hono/service-worker'
   *
   * const app = new Hono()
   * // ...
   * fire(app)
   * ```
   * @see https://hono.dev/docs/api/hono#fire
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
   * @see https://developers.cloudflare.com/workers/reference/migrate-to-module-workers/
   */
  fire = () => {
    addEventListener("fetch", (event) => {
      event.respondWith(this.#dispatch(event.request, event, void 0, event.request.method));
    });
  };
}, "_Hono");

// ../../node_modules/hono/dist/router/reg-exp-router/router.js
init_url();

// ../../node_modules/hono/dist/router/reg-exp-router/matcher.js
var emptyParam = [];
function match(method, path) {
  const matchers = this.buildAllMatchers();
  const match2 = /* @__PURE__ */ __name((method2, path2) => {
    const matcher = matchers[method2] || matchers[METHOD_NAME_ALL];
    const staticMatch = matcher[2][path2];
    if (staticMatch) {
      return staticMatch;
    }
    const match3 = path2.match(matcher[0]);
    if (!match3) {
      return [[], emptyParam];
    }
    const index = match3.indexOf("", 1);
    return [matcher[1][index], match3];
  }, "match2");
  this.match = match2;
  return match2(method, path);
}
__name(match, "match");

// ../../node_modules/hono/dist/router/reg-exp-router/node.js
var LABEL_REG_EXP_STR = "[^/]+";
var ONLY_WILDCARD_REG_EXP_STR = ".*";
var TAIL_WILDCARD_REG_EXP_STR = "(?:|/.*)";
var PATH_ERROR = /* @__PURE__ */ Symbol();
var regExpMetaChars = new Set(".\\+*[^]$()");
function compareKey(a, b) {
  if (a.length === 1) {
    return b.length === 1 ? a < b ? -1 : 1 : -1;
  }
  if (b.length === 1) {
    return 1;
  }
  if (a === ONLY_WILDCARD_REG_EXP_STR || a === TAIL_WILDCARD_REG_EXP_STR) {
    return 1;
  } else if (b === ONLY_WILDCARD_REG_EXP_STR || b === TAIL_WILDCARD_REG_EXP_STR) {
    return -1;
  }
  if (a === LABEL_REG_EXP_STR) {
    return 1;
  } else if (b === LABEL_REG_EXP_STR) {
    return -1;
  }
  return a.length === b.length ? a < b ? -1 : 1 : b.length - a.length;
}
__name(compareKey, "compareKey");
var Node = /* @__PURE__ */ __name(class _Node {
  #index;
  #varIndex;
  #children = /* @__PURE__ */ Object.create(null);
  insert(tokens, index, paramMap, context, pathErrorCheckOnly) {
    if (tokens.length === 0) {
      if (this.#index !== void 0) {
        throw PATH_ERROR;
      }
      if (pathErrorCheckOnly) {
        return;
      }
      this.#index = index;
      return;
    }
    const [token, ...restTokens] = tokens;
    const pattern = token === "*" ? restTokens.length === 0 ? ["", "", ONLY_WILDCARD_REG_EXP_STR] : ["", "", LABEL_REG_EXP_STR] : token === "/*" ? ["", "", TAIL_WILDCARD_REG_EXP_STR] : token.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
    let node;
    if (pattern) {
      const name = pattern[1];
      let regexpStr = pattern[2] || LABEL_REG_EXP_STR;
      if (name && pattern[2]) {
        if (regexpStr === ".*") {
          throw PATH_ERROR;
        }
        regexpStr = regexpStr.replace(/^\((?!\?:)(?=[^)]+\)$)/, "(?:");
        if (/\((?!\?:)/.test(regexpStr)) {
          throw PATH_ERROR;
        }
      }
      node = this.#children[regexpStr];
      if (!node) {
        if (Object.keys(this.#children).some(
          (k) => k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[regexpStr] = new _Node();
        if (name !== "") {
          node.#varIndex = context.varIndex++;
        }
      }
      if (!pathErrorCheckOnly && name !== "") {
        paramMap.push([name, node.#varIndex]);
      }
    } else {
      node = this.#children[token];
      if (!node) {
        if (Object.keys(this.#children).some(
          (k) => k.length > 1 && k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[token] = new _Node();
      }
    }
    node.insert(restTokens, index, paramMap, context, pathErrorCheckOnly);
  }
  buildRegExpStr() {
    const childKeys = Object.keys(this.#children).sort(compareKey);
    const strList = childKeys.map((k) => {
      const c = this.#children[k];
      return (typeof c.#varIndex === "number" ? `(${k})@${c.#varIndex}` : regExpMetaChars.has(k) ? `\\${k}` : k) + c.buildRegExpStr();
    });
    if (typeof this.#index === "number") {
      strList.unshift(`#${this.#index}`);
    }
    if (strList.length === 0) {
      return "";
    }
    if (strList.length === 1) {
      return strList[0];
    }
    return "(?:" + strList.join("|") + ")";
  }
}, "_Node");

// ../../node_modules/hono/dist/router/reg-exp-router/trie.js
var Trie = /* @__PURE__ */ __name(class {
  #context = { varIndex: 0 };
  #root = new Node();
  insert(path, index, pathErrorCheckOnly) {
    const paramAssoc = [];
    const groups = [];
    for (let i = 0; ; ) {
      let replaced = false;
      path = path.replace(/\{[^}]+\}/g, (m) => {
        const mark = `@\\${i}`;
        groups[i] = [mark, m];
        i++;
        replaced = true;
        return mark;
      });
      if (!replaced) {
        break;
      }
    }
    const tokens = path.match(/(?::[^\/]+)|(?:\/\*$)|./g) || [];
    for (let i = groups.length - 1; i >= 0; i--) {
      const [mark] = groups[i];
      for (let j = tokens.length - 1; j >= 0; j--) {
        if (tokens[j].indexOf(mark) !== -1) {
          tokens[j] = tokens[j].replace(mark, groups[i][1]);
          break;
        }
      }
    }
    this.#root.insert(tokens, index, paramAssoc, this.#context, pathErrorCheckOnly);
    return paramAssoc;
  }
  buildRegExp() {
    let regexp = this.#root.buildRegExpStr();
    if (regexp === "") {
      return [/^$/, [], []];
    }
    let captureIndex = 0;
    const indexReplacementMap = [];
    const paramReplacementMap = [];
    regexp = regexp.replace(/#(\d+)|@(\d+)|\.\*\$/g, (_, handlerIndex, paramIndex) => {
      if (handlerIndex !== void 0) {
        indexReplacementMap[++captureIndex] = Number(handlerIndex);
        return "$()";
      }
      if (paramIndex !== void 0) {
        paramReplacementMap[Number(paramIndex)] = ++captureIndex;
        return "";
      }
      return "";
    });
    return [new RegExp(`^${regexp}`), indexReplacementMap, paramReplacementMap];
  }
}, "Trie");

// ../../node_modules/hono/dist/router/reg-exp-router/router.js
var nullMatcher = [/^$/, [], /* @__PURE__ */ Object.create(null)];
var wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
function buildWildcardRegExp(path) {
  return wildcardRegExpCache[path] ??= new RegExp(
    path === "*" ? "" : `^${path.replace(
      /\/\*$|([.\\+*[^\]$()])/g,
      (_, metaChar) => metaChar ? `\\${metaChar}` : "(?:|/.*)"
    )}$`
  );
}
__name(buildWildcardRegExp, "buildWildcardRegExp");
function clearWildcardRegExpCache() {
  wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
}
__name(clearWildcardRegExpCache, "clearWildcardRegExpCache");
function buildMatcherFromPreprocessedRoutes(routes) {
  const trie = new Trie();
  const handlerData = [];
  if (routes.length === 0) {
    return nullMatcher;
  }
  const routesWithStaticPathFlag = routes.map(
    (route) => [!/\*|\/:/.test(route[0]), ...route]
  ).sort(
    ([isStaticA, pathA], [isStaticB, pathB]) => isStaticA ? 1 : isStaticB ? -1 : pathA.length - pathB.length
  );
  const staticMap = /* @__PURE__ */ Object.create(null);
  for (let i = 0, j = -1, len = routesWithStaticPathFlag.length; i < len; i++) {
    const [pathErrorCheckOnly, path, handlers] = routesWithStaticPathFlag[i];
    if (pathErrorCheckOnly) {
      staticMap[path] = [handlers.map(([h]) => [h, /* @__PURE__ */ Object.create(null)]), emptyParam];
    } else {
      j++;
    }
    let paramAssoc;
    try {
      paramAssoc = trie.insert(path, j, pathErrorCheckOnly);
    } catch (e) {
      throw e === PATH_ERROR ? new UnsupportedPathError(path) : e;
    }
    if (pathErrorCheckOnly) {
      continue;
    }
    handlerData[j] = handlers.map(([h, paramCount]) => {
      const paramIndexMap = /* @__PURE__ */ Object.create(null);
      paramCount -= 1;
      for (; paramCount >= 0; paramCount--) {
        const [key, value] = paramAssoc[paramCount];
        paramIndexMap[key] = value;
      }
      return [h, paramIndexMap];
    });
  }
  const [regexp, indexReplacementMap, paramReplacementMap] = trie.buildRegExp();
  for (let i = 0, len = handlerData.length; i < len; i++) {
    for (let j = 0, len2 = handlerData[i].length; j < len2; j++) {
      const map = handlerData[i][j]?.[1];
      if (!map) {
        continue;
      }
      const keys = Object.keys(map);
      for (let k = 0, len3 = keys.length; k < len3; k++) {
        map[keys[k]] = paramReplacementMap[map[keys[k]]];
      }
    }
  }
  const handlerMap = [];
  for (const i in indexReplacementMap) {
    handlerMap[i] = handlerData[indexReplacementMap[i]];
  }
  return [regexp, handlerMap, staticMap];
}
__name(buildMatcherFromPreprocessedRoutes, "buildMatcherFromPreprocessedRoutes");
function findMiddleware(middleware, path) {
  if (!middleware) {
    return void 0;
  }
  for (const k of Object.keys(middleware).sort((a, b) => b.length - a.length)) {
    if (buildWildcardRegExp(k).test(path)) {
      return [...middleware[k]];
    }
  }
  return void 0;
}
__name(findMiddleware, "findMiddleware");
var RegExpRouter = /* @__PURE__ */ __name(class {
  name = "RegExpRouter";
  #middleware;
  #routes;
  constructor() {
    this.#middleware = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
    this.#routes = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
  }
  add(method, path, handler) {
    const middleware = this.#middleware;
    const routes = this.#routes;
    if (!middleware || !routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    if (!middleware[method]) {
      ;
      [middleware, routes].forEach((handlerMap) => {
        handlerMap[method] = /* @__PURE__ */ Object.create(null);
        Object.keys(handlerMap[METHOD_NAME_ALL]).forEach((p) => {
          handlerMap[method][p] = [...handlerMap[METHOD_NAME_ALL][p]];
        });
      });
    }
    if (path === "/*") {
      path = "*";
    }
    const paramCount = (path.match(/\/:/g) || []).length;
    if (/\*$/.test(path)) {
      const re = buildWildcardRegExp(path);
      if (method === METHOD_NAME_ALL) {
        Object.keys(middleware).forEach((m) => {
          middleware[m][path] ||= findMiddleware(middleware[m], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
        });
      } else {
        middleware[method][path] ||= findMiddleware(middleware[method], path) || findMiddleware(middleware[METHOD_NAME_ALL], path) || [];
      }
      Object.keys(middleware).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(middleware[m]).forEach((p) => {
            re.test(p) && middleware[m][p].push([handler, paramCount]);
          });
        }
      });
      Object.keys(routes).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(routes[m]).forEach(
            (p) => re.test(p) && routes[m][p].push([handler, paramCount])
          );
        }
      });
      return;
    }
    const paths = checkOptionalParameter(path) || [path];
    for (let i = 0, len = paths.length; i < len; i++) {
      const path2 = paths[i];
      Object.keys(routes).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          routes[m][path2] ||= [
            ...findMiddleware(middleware[m], path2) || findMiddleware(middleware[METHOD_NAME_ALL], path2) || []
          ];
          routes[m][path2].push([handler, paramCount - len + i + 1]);
        }
      });
    }
  }
  match = match;
  buildAllMatchers() {
    const matchers = /* @__PURE__ */ Object.create(null);
    Object.keys(this.#routes).concat(Object.keys(this.#middleware)).forEach((method) => {
      matchers[method] ||= this.#buildMatcher(method);
    });
    this.#middleware = this.#routes = void 0;
    clearWildcardRegExpCache();
    return matchers;
  }
  #buildMatcher(method) {
    const routes = [];
    let hasOwnRoute = method === METHOD_NAME_ALL;
    [this.#middleware, this.#routes].forEach((r) => {
      const ownRoute = r[method] ? Object.keys(r[method]).map((path) => [path, r[method][path]]) : [];
      if (ownRoute.length !== 0) {
        hasOwnRoute ||= true;
        routes.push(...ownRoute);
      } else if (method !== METHOD_NAME_ALL) {
        routes.push(
          ...Object.keys(r[METHOD_NAME_ALL]).map((path) => [path, r[METHOD_NAME_ALL][path]])
        );
      }
    });
    if (!hasOwnRoute) {
      return null;
    } else {
      return buildMatcherFromPreprocessedRoutes(routes);
    }
  }
}, "RegExpRouter");

// ../../node_modules/hono/dist/router/smart-router/router.js
var SmartRouter = /* @__PURE__ */ __name(class {
  name = "SmartRouter";
  #routers = [];
  #routes = [];
  constructor(init) {
    this.#routers = init.routers;
  }
  add(method, path, handler) {
    if (!this.#routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    this.#routes.push([method, path, handler]);
  }
  match(method, path) {
    if (!this.#routes) {
      throw new Error("Fatal error");
    }
    const routers = this.#routers;
    const routes = this.#routes;
    const len = routers.length;
    let i = 0;
    let res;
    for (; i < len; i++) {
      const router = routers[i];
      try {
        for (let i2 = 0, len2 = routes.length; i2 < len2; i2++) {
          router.add(...routes[i2]);
        }
        res = router.match(method, path);
      } catch (e) {
        if (e instanceof UnsupportedPathError) {
          continue;
        }
        throw e;
      }
      this.match = router.match.bind(router);
      this.#routers = [router];
      this.#routes = void 0;
      break;
    }
    if (i === len) {
      throw new Error("Fatal error");
    }
    this.name = `SmartRouter + ${this.activeRouter.name}`;
    return res;
  }
  get activeRouter() {
    if (this.#routes || this.#routers.length !== 1) {
      throw new Error("No active router has been determined yet.");
    }
    return this.#routers[0];
  }
}, "SmartRouter");

// ../../node_modules/hono/dist/router/trie-router/router.js
init_url();

// ../../node_modules/hono/dist/router/trie-router/node.js
init_url();
var emptyParams = /* @__PURE__ */ Object.create(null);
var Node2 = /* @__PURE__ */ __name(class _Node2 {
  #methods;
  #children;
  #patterns;
  #order = 0;
  #params = emptyParams;
  constructor(method, handler, children) {
    this.#children = children || /* @__PURE__ */ Object.create(null);
    this.#methods = [];
    if (method && handler) {
      const m = /* @__PURE__ */ Object.create(null);
      m[method] = { handler, possibleKeys: [], score: 0 };
      this.#methods = [m];
    }
    this.#patterns = [];
  }
  insert(method, path, handler) {
    this.#order = ++this.#order;
    let curNode = this;
    const parts = splitRoutingPath(path);
    const possibleKeys = [];
    for (let i = 0, len = parts.length; i < len; i++) {
      const p = parts[i];
      const nextP = parts[i + 1];
      const pattern = getPattern(p, nextP);
      const key = Array.isArray(pattern) ? pattern[0] : p;
      if (key in curNode.#children) {
        curNode = curNode.#children[key];
        if (pattern) {
          possibleKeys.push(pattern[1]);
        }
        continue;
      }
      curNode.#children[key] = new _Node2();
      if (pattern) {
        curNode.#patterns.push(pattern);
        possibleKeys.push(pattern[1]);
      }
      curNode = curNode.#children[key];
    }
    curNode.#methods.push({
      [method]: {
        handler,
        possibleKeys: possibleKeys.filter((v, i, a) => a.indexOf(v) === i),
        score: this.#order
      }
    });
    return curNode;
  }
  #getHandlerSets(node, method, nodeParams, params) {
    const handlerSets = [];
    for (let i = 0, len = node.#methods.length; i < len; i++) {
      const m = node.#methods[i];
      const handlerSet = m[method] || m[METHOD_NAME_ALL];
      const processedSet = {};
      if (handlerSet !== void 0) {
        handlerSet.params = /* @__PURE__ */ Object.create(null);
        handlerSets.push(handlerSet);
        if (nodeParams !== emptyParams || params && params !== emptyParams) {
          for (let i2 = 0, len2 = handlerSet.possibleKeys.length; i2 < len2; i2++) {
            const key = handlerSet.possibleKeys[i2];
            const processed = processedSet[handlerSet.score];
            handlerSet.params[key] = params?.[key] && !processed ? params[key] : nodeParams[key] ?? params?.[key];
            processedSet[handlerSet.score] = true;
          }
        }
      }
    }
    return handlerSets;
  }
  search(method, path) {
    const handlerSets = [];
    this.#params = emptyParams;
    const curNode = this;
    let curNodes = [curNode];
    const parts = splitPath(path);
    const curNodesQueue = [];
    for (let i = 0, len = parts.length; i < len; i++) {
      const part = parts[i];
      const isLast = i === len - 1;
      const tempNodes = [];
      for (let j = 0, len2 = curNodes.length; j < len2; j++) {
        const node = curNodes[j];
        const nextNode = node.#children[part];
        if (nextNode) {
          nextNode.#params = node.#params;
          if (isLast) {
            if (nextNode.#children["*"]) {
              handlerSets.push(
                ...this.#getHandlerSets(nextNode.#children["*"], method, node.#params)
              );
            }
            handlerSets.push(...this.#getHandlerSets(nextNode, method, node.#params));
          } else {
            tempNodes.push(nextNode);
          }
        }
        for (let k = 0, len3 = node.#patterns.length; k < len3; k++) {
          const pattern = node.#patterns[k];
          const params = node.#params === emptyParams ? {} : { ...node.#params };
          if (pattern === "*") {
            const astNode = node.#children["*"];
            if (astNode) {
              handlerSets.push(...this.#getHandlerSets(astNode, method, node.#params));
              astNode.#params = params;
              tempNodes.push(astNode);
            }
            continue;
          }
          const [key, name, matcher] = pattern;
          if (!part && !(matcher instanceof RegExp)) {
            continue;
          }
          const child = node.#children[key];
          const restPathString = parts.slice(i).join("/");
          if (matcher instanceof RegExp) {
            const m = matcher.exec(restPathString);
            if (m) {
              params[name] = m[0];
              handlerSets.push(...this.#getHandlerSets(child, method, node.#params, params));
              if (Object.keys(child.#children).length) {
                child.#params = params;
                const componentCount = m[0].match(/\//)?.length ?? 0;
                const targetCurNodes = curNodesQueue[componentCount] ||= [];
                targetCurNodes.push(child);
              }
              continue;
            }
          }
          if (matcher === true || matcher.test(part)) {
            params[name] = part;
            if (isLast) {
              handlerSets.push(...this.#getHandlerSets(child, method, params, node.#params));
              if (child.#children["*"]) {
                handlerSets.push(
                  ...this.#getHandlerSets(child.#children["*"], method, params, node.#params)
                );
              }
            } else {
              child.#params = params;
              tempNodes.push(child);
            }
          }
        }
      }
      curNodes = tempNodes.concat(curNodesQueue.shift() ?? []);
    }
    if (handlerSets.length > 1) {
      handlerSets.sort((a, b) => {
        return a.score - b.score;
      });
    }
    return [handlerSets.map(({ handler, params }) => [handler, params])];
  }
}, "_Node");

// ../../node_modules/hono/dist/router/trie-router/router.js
var TrieRouter = /* @__PURE__ */ __name(class {
  name = "TrieRouter";
  #node;
  constructor() {
    this.#node = new Node2();
  }
  add(method, path, handler) {
    const results = checkOptionalParameter(path);
    if (results) {
      for (let i = 0, len = results.length; i < len; i++) {
        this.#node.insert(method, results[i], handler);
      }
      return;
    }
    this.#node.insert(method, path, handler);
  }
  match(method, path) {
    return this.#node.search(method, path);
  }
}, "TrieRouter");

// ../../node_modules/hono/dist/hono.js
var Hono2 = /* @__PURE__ */ __name(class extends Hono {
  /**
   * Creates an instance of the Hono class.
   *
   * @param options - Optional configuration options for the Hono instance.
   */
  constructor(options = {}) {
    super(options);
    this.router = options.router ?? new SmartRouter({
      routers: [new RegExpRouter(), new TrieRouter()]
    });
  }
}, "Hono");

// ../../node_modules/hono/dist/middleware/cors/index.js
var cors = /* @__PURE__ */ __name((options) => {
  const defaults = {
    origin: "*",
    allowMethods: ["GET", "HEAD", "PUT", "POST", "DELETE", "PATCH"],
    allowHeaders: [],
    exposeHeaders: []
  };
  const opts = {
    ...defaults,
    ...options
  };
  const findAllowOrigin = ((optsOrigin) => {
    if (typeof optsOrigin === "string") {
      if (optsOrigin === "*") {
        return () => optsOrigin;
      } else {
        return (origin) => optsOrigin === origin ? origin : null;
      }
    } else if (typeof optsOrigin === "function") {
      return optsOrigin;
    } else {
      return (origin) => optsOrigin.includes(origin) ? origin : null;
    }
  })(opts.origin);
  const findAllowMethods = ((optsAllowMethods) => {
    if (typeof optsAllowMethods === "function") {
      return optsAllowMethods;
    } else if (Array.isArray(optsAllowMethods)) {
      return () => optsAllowMethods;
    } else {
      return () => [];
    }
  })(opts.allowMethods);
  return /* @__PURE__ */ __name(async function cors2(c, next) {
    function set(key, value) {
      c.res.headers.set(key, value);
    }
    __name(set, "set");
    const allowOrigin = await findAllowOrigin(c.req.header("origin") || "", c);
    if (allowOrigin) {
      set("Access-Control-Allow-Origin", allowOrigin);
    }
    if (opts.credentials) {
      set("Access-Control-Allow-Credentials", "true");
    }
    if (opts.exposeHeaders?.length) {
      set("Access-Control-Expose-Headers", opts.exposeHeaders.join(","));
    }
    if (c.req.method === "OPTIONS") {
      if (opts.origin !== "*") {
        set("Vary", "Origin");
      }
      if (opts.maxAge != null) {
        set("Access-Control-Max-Age", opts.maxAge.toString());
      }
      const allowMethods = await findAllowMethods(c.req.header("origin") || "", c);
      if (allowMethods.length) {
        set("Access-Control-Allow-Methods", allowMethods.join(","));
      }
      let headers = opts.allowHeaders;
      if (!headers?.length) {
        const requestHeaders = c.req.header("Access-Control-Request-Headers");
        if (requestHeaders) {
          headers = requestHeaders.split(/\s*,\s*/);
        }
      }
      if (headers?.length) {
        set("Access-Control-Allow-Headers", headers.join(","));
        c.res.headers.append("Vary", "Access-Control-Request-Headers");
      }
      c.res.headers.delete("Content-Length");
      c.res.headers.delete("Content-Type");
      return new Response(null, {
        headers: c.res.headers,
        status: 204,
        statusText: "No Content"
      });
    }
    await next();
    if (opts.origin !== "*") {
      c.header("Vary", "Origin", { append: true });
    }
  }, "cors2");
}, "cors");

// src/middleware/auth.ts
init_jwt4();
function getJwtSecret(c) {
  return c.env.JWT_SECRET || "dev-secret-change-in-production";
}
__name(getJwtSecret, "getJwtSecret");
async function authMiddleware(c, next) {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const token = authHeader.slice(7);
  try {
    const payload = await verify2(token, getJwtSecret(c), "HS256");
    c.set("user", payload);
    await next();
  } catch {
    return c.json({ error: "Invalid token" }, 401);
  }
}
__name(authMiddleware, "authMiddleware");
async function createToken(c, payload) {
  return await sign2(
    { ...payload, exp: Math.floor(Date.now() / 1e3) + 60 * 60 * 24 * 7 },
    // 7 days
    getJwtSecret(c)
  );
}
__name(createToken, "createToken");

// src/routes/auth.ts
var auth = new Hono2();
auth.post("/login", async (c) => {
  const { email, password } = await c.req.json();
  if (!email || !password) {
    return c.json({ error: "Email and password required" }, 400);
  }
  const user = await c.env.DB.prepare(
    "SELECT id, email, password_hash, name FROM users WHERE email = ?"
  ).bind(email).first();
  if (!user) {
    return c.json({ error: "Invalid credentials" }, 401);
  }
  if (user.password_hash !== password) {
    return c.json({ error: "Invalid credentials" }, 401);
  }
  const token = await createToken(c, {
    sub: user.id,
    email: user.email
  });
  return c.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name
    }
  });
});
auth.post("/register", async (c) => {
  const { email, password, name } = await c.req.json();
  if (!email || !password) {
    return c.json({ error: "Email and password required" }, 400);
  }
  const existing = await c.env.DB.prepare(
    "SELECT id FROM users WHERE email = ?"
  ).bind(email).first();
  if (existing) {
    return c.json({ error: "Email already registered" }, 400);
  }
  const id = crypto.randomUUID();
  await c.env.DB.prepare(
    "INSERT INTO users (id, email, password_hash, name, created_at) VALUES (?, ?, ?, ?, ?)"
  ).bind(id, email, password, name || null, Math.floor(Date.now() / 1e3)).run();
  const token = await createToken(c, { sub: id, email });
  return c.json({
    token,
    user: { id, email, name }
  });
});
auth.get("/me", async (c) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const { verify: verify3 } = await Promise.resolve().then(() => (init_jwt4(), jwt_exports));
  const token = authHeader.slice(7);
  try {
    const payload = await verify3(token, getJwtSecret(c), "HS256");
    const user = await c.env.DB.prepare(
      "SELECT id, email, name, created_at FROM users WHERE id = ?"
    ).bind(payload.sub).first();
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }
    const workspaces2 = await c.env.DB.prepare(
      "SELECT id, name, slug, package, status FROM workspaces WHERE user_id = ?"
    ).bind(payload.sub).all();
    return c.json({
      user,
      workspaces: workspaces2.results
    });
  } catch {
    return c.json({ error: "Invalid token" }, 401);
  }
});
auth.get("/google", (c) => {
  const clientId = c.env.GOOGLE_CLIENT_ID;
  const redirectUri = c.env.GOOGLE_REDIRECT_URI || `${new URL(c.req.url).origin}/auth/google/callback`;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "consent"
  });
  return c.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
});
auth.get("/google/callback", async (c) => {
  const code = c.req.query("code");
  const error = c.req.query("error");
  if (error) {
    return c.redirect("http://localhost:5173/login?error=google_denied");
  }
  if (!code) {
    return c.redirect("http://localhost:5173/login?error=no_code");
  }
  const clientId = c.env.GOOGLE_CLIENT_ID;
  const clientSecret = c.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = c.env.GOOGLE_REDIRECT_URI || `${new URL(c.req.url).origin}/auth/google/callback`;
  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code"
      })
    });
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      return c.redirect("http://localhost:5173/login?error=token_failed");
    }
    const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    const googleUser = await userRes.json();
    let user = await c.env.DB.prepare(
      "SELECT id, email, name FROM users WHERE email = ?"
    ).bind(googleUser.email).first();
    if (!user) {
      const id = crypto.randomUUID();
      await c.env.DB.prepare(
        "INSERT INTO users (id, email, password_hash, name, created_at) VALUES (?, ?, ?, ?, ?)"
      ).bind(id, googleUser.email, `google:${googleUser.sub}`, googleUser.name || null, Math.floor(Date.now() / 1e3)).run();
      user = { id, email: googleUser.email, name: googleUser.name || null };
    }
    const token = await createToken(c, {
      sub: user.id,
      email: user.email
    });
    return c.redirect(`http://localhost:5173/auth/callback?token=${token}`);
  } catch (err) {
    console.error("Google OAuth error:", err);
    return c.redirect("http://localhost:5173/login?error=oauth_failed");
  }
});
var auth_default = auth;

// src/routes/workspaces.ts
var workspaces = new Hono2();
workspaces.use("/*", authMiddleware);
workspaces.get("/", async (c) => {
  const user = c.get("user");
  const result = await c.env.DB.prepare(
    "SELECT w.*, n.name as node_name, n.region FROM workspaces w LEFT JOIN nodes n ON w.node_id = n.id WHERE w.user_id = ?"
  ).bind(user.sub).all();
  return c.json({ workspaces: result.results });
});
workspaces.post("/", async (c) => {
  const user = c.get("user");
  const { name, slug } = await c.req.json();
  if (!name || !slug) {
    return c.json({ error: "Name and slug required" }, 400);
  }
  const existing = await c.env.DB.prepare(
    "SELECT id FROM workspaces WHERE slug = ?"
  ).bind(slug).first();
  if (existing) {
    return c.json({ error: "Slug already taken" }, 400);
  }
  const id = crypto.randomUUID();
  await c.env.DB.prepare(
    "INSERT INTO workspaces (id, user_id, name, slug, package, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
  ).bind(id, user.sub, name, slug, "starter", "active", Math.floor(Date.now() / 1e3)).run();
  return c.json({ id, name, slug, package: "starter", status: "active" }, 201);
});
workspaces.get("/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const workspace = await c.env.DB.prepare(
    "SELECT w.*, n.name as node_name, n.acs_url, n.radius_url FROM workspaces w LEFT JOIN nodes n ON w.node_id = n.id WHERE w.id = ? AND w.user_id = ?"
  ).bind(id, user.sub).first();
  if (!workspace) {
    return c.json({ error: "Workspace not found" }, 404);
  }
  return c.json(workspace);
});
workspaces.put("/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const { name, nodeId } = await c.req.json();
  const existing = await c.env.DB.prepare(
    "SELECT id FROM workspaces WHERE id = ? AND user_id = ?"
  ).bind(id, user.sub).first();
  if (!existing) {
    return c.json({ error: "Workspace not found" }, 404);
  }
  const updates = [];
  const values = [];
  if (name) {
    updates.push("name = ?");
    values.push(name);
  }
  if (nodeId) {
    updates.push("node_id = ?");
    values.push(nodeId);
  }
  if (updates.length === 0) {
    return c.json({ error: "No fields to update" }, 400);
  }
  values.push(id);
  await c.env.DB.prepare(
    `UPDATE workspaces SET ${updates.join(", ")} WHERE id = ?`
  ).bind(...values).run();
  return c.json({ success: true });
});
workspaces.delete("/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const result = await c.env.DB.prepare(
    "DELETE FROM workspaces WHERE id = ? AND user_id = ?"
  ).bind(id, user.sub).run();
  if (result.meta.changes === 0) {
    return c.json({ error: "Workspace not found" }, 404);
  }
  return c.json({ success: true });
});
var workspaces_default = workspaces;

// src/routes/subscribers.ts
var subscribers = new Hono2();
subscribers.use("/*", authMiddleware);
subscribers.get("/workspace/:workspaceId", async (c) => {
  const user = c.get("user");
  const workspaceId = c.req.param("workspaceId");
  const workspace = await c.env.DB.prepare(
    "SELECT id FROM workspaces WHERE id = ? AND user_id = ?"
  ).bind(workspaceId, user.sub).first();
  if (!workspace) {
    return c.json({ error: "Workspace not found" }, 404);
  }
  const result = await c.env.DB.prepare(`
    SELECT s.*, p.name as plan_name 
    FROM subscribers s 
    LEFT JOIN plans p ON s.plan_id = p.id 
    WHERE s.workspace_id = ?
    ORDER BY s.created_at DESC
  `).bind(workspaceId).all();
  return c.json({ subscribers: result.results });
});
subscribers.post("/workspace/:workspaceId", async (c) => {
  const user = c.get("user");
  const workspaceId = c.req.param("workspaceId");
  const { username, name, email, whatsapp, address, notes, planId } = await c.req.json();
  const workspace = await c.env.DB.prepare(
    "SELECT id, package FROM workspaces WHERE id = ? AND user_id = ?"
  ).bind(workspaceId, user.sub).first();
  if (!workspace) {
    return c.json({ error: "Workspace not found" }, 404);
  }
  if (!username) {
    return c.json({ error: "Username required" }, 400);
  }
  const countResult = await c.env.DB.prepare(
    "SELECT COUNT(*) as count FROM subscribers WHERE workspace_id = ?"
  ).bind(workspaceId).first();
  const packageLimits = await c.env.DB.prepare(
    "SELECT max_subscribers FROM packages WHERE name = ?"
  ).bind(workspace.package).first();
  if (packageLimits && packageLimits.max_subscribers !== -1) {
    if (countResult?.count >= packageLimits.max_subscribers) {
      return c.json({ error: "Subscriber limit reached. Upgrade your plan." }, 403);
    }
  }
  const id = crypto.randomUUID();
  await c.env.DB.prepare(`
    INSERT INTO subscribers (id, workspace_id, username, name, email, whatsapp, address, notes, plan_id, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)
  `).bind(
    id,
    workspaceId,
    username,
    name || null,
    email || null,
    whatsapp || null,
    address || null,
    notes || null,
    planId || null,
    Math.floor(Date.now() / 1e3)
  ).run();
  return c.json({ id, username, status: "active" }, 201);
});
subscribers.get("/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const subscriber = await c.env.DB.prepare(`
    SELECT s.*, p.name as plan_name, w.name as workspace_name
    FROM subscribers s
    LEFT JOIN plans p ON s.plan_id = p.id
    JOIN workspaces w ON s.workspace_id = w.id
    WHERE s.id = ? AND w.user_id = ?
  `).bind(id, user.sub).first();
  if (!subscriber) {
    return c.json({ error: "Subscriber not found" }, 404);
  }
  const tags2 = await c.env.DB.prepare(`
    SELECT t.id, t.name, t.color
    FROM tags t
    JOIN subscriber_tags st ON t.id = st.tag_id
    WHERE st.subscriber_id = ?
  `).bind(id).all();
  return c.json({ ...subscriber, tags: tags2.results });
});
subscribers.put("/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const body = await c.req.json();
  const existing = await c.env.DB.prepare(`
    SELECT s.id FROM subscribers s
    JOIN workspaces w ON s.workspace_id = w.id
    WHERE s.id = ? AND w.user_id = ?
  `).bind(id, user.sub).first();
  if (!existing) {
    return c.json({ error: "Subscriber not found" }, 404);
  }
  const allowedFields = ["name", "email", "whatsapp", "address", "notes", "plan_id", "status", "expire_at"];
  const updates = [];
  const values = [];
  for (const field of allowedFields) {
    if (body[field] !== void 0) {
      updates.push(`${field} = ?`);
      values.push(body[field]);
    }
  }
  if (updates.length === 0) {
    return c.json({ error: "No fields to update" }, 400);
  }
  values.push(id);
  await c.env.DB.prepare(
    `UPDATE subscribers SET ${updates.join(", ")} WHERE id = ?`
  ).bind(...values).run();
  return c.json({ success: true });
});
subscribers.post("/:id/suspend", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const result = await c.env.DB.prepare(`
    UPDATE subscribers SET status = 'suspended'
    WHERE id = ? AND workspace_id IN (SELECT id FROM workspaces WHERE user_id = ?)
  `).bind(id, user.sub).run();
  if (result.meta.changes === 0) {
    return c.json({ error: "Subscriber not found" }, 404);
  }
  return c.json({ success: true, status: "suspended" });
});
subscribers.post("/:id/activate", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const result = await c.env.DB.prepare(`
    UPDATE subscribers SET status = 'active'
    WHERE id = ? AND workspace_id IN (SELECT id FROM workspaces WHERE user_id = ?)
  `).bind(id, user.sub).run();
  if (result.meta.changes === 0) {
    return c.json({ error: "Subscriber not found" }, 404);
  }
  return c.json({ success: true, status: "active" });
});
subscribers.delete("/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const result = await c.env.DB.prepare(`
    DELETE FROM subscribers
    WHERE id = ? AND workspace_id IN (SELECT id FROM workspaces WHERE user_id = ?)
  `).bind(id, user.sub).run();
  if (result.meta.changes === 0) {
    return c.json({ error: "Subscriber not found" }, 404);
  }
  return c.json({ success: true });
});
var subscribers_default = subscribers;

// src/routes/plans.ts
var plans = new Hono2();
plans.use("/*", authMiddleware);
plans.get("/workspace/:workspaceId", async (c) => {
  const user = c.get("user");
  const workspaceId = c.req.param("workspaceId");
  const workspace = await c.env.DB.prepare(
    "SELECT id FROM workspaces WHERE id = ? AND user_id = ?"
  ).bind(workspaceId, user.sub).first();
  if (!workspace) {
    return c.json({ error: "Workspace not found" }, 404);
  }
  const result = await c.env.DB.prepare(
    "SELECT * FROM plans WHERE workspace_id = ?"
  ).bind(workspaceId).all();
  return c.json({ plans: result.results });
});
plans.post("/workspace/:workspaceId", async (c) => {
  const user = c.get("user");
  const workspaceId = c.req.param("workspaceId");
  const { name, downloadRate, uploadRate, quotaBytes, price, validityDays } = await c.req.json();
  const workspace = await c.env.DB.prepare(
    "SELECT id FROM workspaces WHERE id = ? AND user_id = ?"
  ).bind(workspaceId, user.sub).first();
  if (!workspace) {
    return c.json({ error: "Workspace not found" }, 404);
  }
  if (!name) {
    return c.json({ error: "Plan name required" }, 400);
  }
  const id = crypto.randomUUID();
  await c.env.DB.prepare(`
    INSERT INTO plans (id, workspace_id, name, download_rate, upload_rate, quota_bytes, price, validity_days)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id,
    workspaceId,
    name,
    downloadRate || null,
    uploadRate || null,
    quotaBytes || null,
    price || null,
    validityDays || null
  ).run();
  return c.json({ id, name }, 201);
});
plans.get("/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const plan = await c.env.DB.prepare(`
    SELECT p.* FROM plans p
    JOIN workspaces w ON p.workspace_id = w.id
    WHERE p.id = ? AND w.user_id = ?
  `).bind(id, user.sub).first();
  if (!plan) {
    return c.json({ error: "Plan not found" }, 404);
  }
  return c.json(plan);
});
plans.put("/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const body = await c.req.json();
  const existing = await c.env.DB.prepare(`
    SELECT p.id FROM plans p
    JOIN workspaces w ON p.workspace_id = w.id
    WHERE p.id = ? AND w.user_id = ?
  `).bind(id, user.sub).first();
  if (!existing) {
    return c.json({ error: "Plan not found" }, 404);
  }
  const allowedFields = ["name", "download_rate", "upload_rate", "quota_bytes", "price", "validity_days"];
  const updates = [];
  const values = [];
  for (const field of allowedFields) {
    const camelField = field.replace(/_([a-z])/g, (_, l) => l.toUpperCase());
    if (body[camelField] !== void 0) {
      updates.push(`${field} = ?`);
      values.push(body[camelField]);
    }
  }
  if (updates.length === 0) {
    return c.json({ error: "No fields to update" }, 400);
  }
  values.push(id);
  await c.env.DB.prepare(
    `UPDATE plans SET ${updates.join(", ")} WHERE id = ?`
  ).bind(...values).run();
  return c.json({ success: true });
});
plans.delete("/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const result = await c.env.DB.prepare(`
    DELETE FROM plans
    WHERE id = ? AND workspace_id IN (SELECT id FROM workspaces WHERE user_id = ?)
  `).bind(id, user.sub).run();
  if (result.meta.changes === 0) {
    return c.json({ error: "Plan not found" }, 404);
  }
  return c.json({ success: true });
});
var plans_default = plans;

// src/routes/invoices.ts
var invoices = new Hono2();
invoices.use("/*", authMiddleware);
invoices.get("/workspace/:workspaceId", async (c) => {
  const user = c.get("user");
  const workspaceId = c.req.param("workspaceId");
  const status = c.req.query("status");
  const workspace = await c.env.DB.prepare(
    "SELECT id FROM workspaces WHERE id = ? AND user_id = ?"
  ).bind(workspaceId, user.sub).first();
  if (!workspace) {
    return c.json({ error: "Workspace not found" }, 404);
  }
  let query = `
    SELECT i.*, s.username as subscriber_username, s.name as subscriber_name
    FROM invoices i
    LEFT JOIN subscribers s ON i.subscriber_id = s.id
    WHERE i.workspace_id = ?
  `;
  const bindings = [workspaceId];
  if (status) {
    query += " AND i.status = ?";
    bindings.push(status);
  }
  query += " ORDER BY i.created_at DESC";
  const result = await c.env.DB.prepare(query).bind(...bindings).all();
  return c.json({ invoices: result.results });
});
invoices.post("/workspace/:workspaceId", async (c) => {
  const user = c.get("user");
  const workspaceId = c.req.param("workspaceId");
  const { subscriberId, amount, dueDate } = await c.req.json();
  const workspace = await c.env.DB.prepare(
    "SELECT id FROM workspaces WHERE id = ? AND user_id = ?"
  ).bind(workspaceId, user.sub).first();
  if (!workspace) {
    return c.json({ error: "Workspace not found" }, 404);
  }
  if (!amount) {
    return c.json({ error: "Amount required" }, 400);
  }
  const id = crypto.randomUUID();
  await c.env.DB.prepare(`
    INSERT INTO invoices (id, workspace_id, subscriber_id, amount, status, due_date, created_at)
    VALUES (?, ?, ?, ?, 'pending', ?, ?)
  `).bind(
    id,
    workspaceId,
    subscriberId || null,
    amount,
    dueDate || null,
    Math.floor(Date.now() / 1e3)
  ).run();
  return c.json({ id, amount, status: "pending" }, 201);
});
invoices.get("/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const invoice = await c.env.DB.prepare(`
    SELECT i.*, s.username as subscriber_username, s.name as subscriber_name, s.email as subscriber_email
    FROM invoices i
    LEFT JOIN subscribers s ON i.subscriber_id = s.id
    JOIN workspaces w ON i.workspace_id = w.id
    WHERE i.id = ? AND w.user_id = ?
  `).bind(id, user.sub).first();
  if (!invoice) {
    return c.json({ error: "Invoice not found" }, 404);
  }
  return c.json(invoice);
});
invoices.post("/:id/pay", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const result = await c.env.DB.prepare(`
    UPDATE invoices SET status = 'paid', paid_at = ?
    WHERE id = ? AND workspace_id IN (SELECT id FROM workspaces WHERE user_id = ?)
  `).bind(Math.floor(Date.now() / 1e3), id, user.sub).run();
  if (result.meta.changes === 0) {
    return c.json({ error: "Invoice not found" }, 404);
  }
  return c.json({ success: true, status: "paid" });
});
invoices.post("/:id/cancel", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const result = await c.env.DB.prepare(`
    UPDATE invoices SET status = 'cancelled'
    WHERE id = ? AND workspace_id IN (SELECT id FROM workspaces WHERE user_id = ?)
  `).bind(id, user.sub).run();
  if (result.meta.changes === 0) {
    return c.json({ error: "Invoice not found" }, 404);
  }
  return c.json({ success: true, status: "cancelled" });
});
invoices.delete("/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const result = await c.env.DB.prepare(`
    DELETE FROM invoices
    WHERE id = ? AND workspace_id IN (SELECT id FROM workspaces WHERE user_id = ?)
  `).bind(id, user.sub).run();
  if (result.meta.changes === 0) {
    return c.json({ error: "Invoice not found" }, 404);
  }
  return c.json({ success: true });
});
var invoices_default = invoices;

// src/routes/tags.ts
var tags = new Hono2();
tags.use("/*", authMiddleware);
tags.get("/workspace/:workspaceId", async (c) => {
  const user = c.get("user");
  const workspaceId = c.req.param("workspaceId");
  const workspace = await c.env.DB.prepare(
    "SELECT id FROM workspaces WHERE id = ? AND user_id = ?"
  ).bind(workspaceId, user.sub).first();
  if (!workspace) {
    return c.json({ error: "Workspace not found" }, 404);
  }
  const result = await c.env.DB.prepare(
    "SELECT * FROM tags WHERE workspace_id = ?"
  ).bind(workspaceId).all();
  return c.json({ tags: result.results });
});
tags.post("/workspace/:workspaceId", async (c) => {
  const user = c.get("user");
  const workspaceId = c.req.param("workspaceId");
  const { name, color } = await c.req.json();
  const workspace = await c.env.DB.prepare(
    "SELECT id FROM workspaces WHERE id = ? AND user_id = ?"
  ).bind(workspaceId, user.sub).first();
  if (!workspace) {
    return c.json({ error: "Workspace not found" }, 404);
  }
  if (!name) {
    return c.json({ error: "Tag name required" }, 400);
  }
  const id = crypto.randomUUID();
  await c.env.DB.prepare(
    "INSERT INTO tags (id, workspace_id, name, color) VALUES (?, ?, ?, ?)"
  ).bind(id, workspaceId, name, color || "#6b7280").run();
  return c.json({ id, name, color: color || "#6b7280" }, 201);
});
tags.delete("/:id", async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const result = await c.env.DB.prepare(`
    DELETE FROM tags
    WHERE id = ? AND workspace_id IN (SELECT id FROM workspaces WHERE user_id = ?)
  `).bind(id, user.sub).run();
  if (result.meta.changes === 0) {
    return c.json({ error: "Tag not found" }, 404);
  }
  await c.env.DB.prepare("DELETE FROM subscriber_tags WHERE tag_id = ?").bind(id).run();
  return c.json({ success: true });
});
tags.post("/subscriber/:subscriberId/:tagId", async (c) => {
  const user = c.get("user");
  const subscriberId = c.req.param("subscriberId");
  const tagId = c.req.param("tagId");
  const subscriber = await c.env.DB.prepare(`
    SELECT s.id FROM subscribers s
    JOIN workspaces w ON s.workspace_id = w.id
    WHERE s.id = ? AND w.user_id = ?
  `).bind(subscriberId, user.sub).first();
  if (!subscriber) {
    return c.json({ error: "Subscriber not found" }, 404);
  }
  try {
    await c.env.DB.prepare(
      "INSERT INTO subscriber_tags (subscriber_id, tag_id) VALUES (?, ?)"
    ).bind(subscriberId, tagId).run();
  } catch {
  }
  return c.json({ success: true });
});
tags.delete("/subscriber/:subscriberId/:tagId", async (c) => {
  const user = c.get("user");
  const subscriberId = c.req.param("subscriberId");
  const tagId = c.req.param("tagId");
  const subscriber = await c.env.DB.prepare(`
    SELECT s.id FROM subscribers s
    JOIN workspaces w ON s.workspace_id = w.id
    WHERE s.id = ? AND w.user_id = ?
  `).bind(subscriberId, user.sub).first();
  if (!subscriber) {
    return c.json({ error: "Subscriber not found" }, 404);
  }
  await c.env.DB.prepare(
    "DELETE FROM subscriber_tags WHERE subscriber_id = ? AND tag_id = ?"
  ).bind(subscriberId, tagId).run();
  return c.json({ success: true });
});
var tags_default = tags;

// src/index.ts
var app = new Hono2();
app.use("/*", cors());
app.get("/", (c) => c.json({ message: "Mikrodius API", version: "1.0.0" }));
app.get("/health", (c) => c.json({ status: "ok" }));
app.get("/config/packages", async (c) => {
  const cached = await c.env.CACHE.get("packages", "json");
  if (cached)
    return c.json(cached);
  const result = await c.env.DB.prepare("SELECT * FROM packages").all();
  const packages = {};
  for (const row of result.results) {
    packages[row.name] = {
      max_nas: row.max_nas,
      max_subscribers: row.max_subscribers,
      max_devices: row.max_devices,
      rate_limit: row.rate_limit
    };
  }
  await c.env.CACHE.put("packages", JSON.stringify(packages), { expirationTtl: 3600 });
  return c.json(packages);
});
app.route("/auth", auth_default);
app.route("/workspaces", workspaces_default);
app.route("/subscribers", subscribers_default);
app.route("/plans", plans_default);
app.route("/invoices", invoices_default);
app.route("/tags", tags_default);
var src_default = app;
export {
  src_default as default
};
//# sourceMappingURL=index.js.map
