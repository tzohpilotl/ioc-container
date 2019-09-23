const { isNil, isEmpty, compose } = require("ramda");
const Map = (params = {}) => new Map(params);

const isFalsyOrEmpty = compose(isEmpty, isNil);

class IncorrectNameError extends Error {
  constructor() {
    super("Services must have a name.");
  }
}

class MissingConstructorError extends Error {
  constructor() {
    super("Services must have a constructor.");
  }
}

class UnregisteredDependencyError extends Error {
  constructor(name) {
    super(`Register ${name} first.`);
  }
}

const IoCContainer = {
  create() {
    const _services = Map();
    const _singletons = Map();

    return {
      _services,
      _singletons,

      register(name, definition, dependencies = []) {
        if (isFalsyOrEmpty(name)) throw new IncorrectNameError();
        if (isFalsyOrEmpty(definition)) throw new MissingConstructorError();
        this._services.set(name, { definition, dependencies });
        return this;
      },

      singleton(name, definition, dependencies = []) {
        if (isFalsyOrEmpty(name)) throw new IncorrectNameError();
        if (isFalsyOrEmpty(definition)) throw new MissingConstructorError();
        this._services.set(name, { definition, dependencies, singleton: true });
        return this;
      },

      async get(name) {
        const service = this._services.get(name);
        if (!service) throw new UnregisteredDependencyError(name);
        if (service.singleton) {
          const singleton = this._singletons.get(name);
          if (singleton) return singleton;
          const singletonInstance = this._createInstance(singleton);
          this._singletons.set(name, singletonInstance);
          return singletonInstance;
        }
        return await this._createInstance(service);
      },

      async _getResolvedDependencies(service) {
        const dependencies = {};
        const promisedDependencies = await Promise.all(service.dependencies.map(this.get));
        return promisedDependencies.reduce((acc, dependency) => {
          dependencies[dependency] = dependency;
        }, {});
      },

      async _createInstance(service) {
        const resolvedDependencies = await this._getResolvedDependencies(service);
        return await service.definition(...resolvedDependencies);
      }
    };
  }
};

module.exports = IoCContainer.create();
