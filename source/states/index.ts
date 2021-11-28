// nodejs
import * as node_events from "events";

export class StateHandler<State> {
	private readonly _UUID: number;
	private _state: State;
	private readonly _event: node_events.EventEmitter;

	constructor(args: {
		state: StateHandler<State>["_state"];
	}) {
		this._UUID = random(0, 6974, "double");
		this._state = args.state;
		this._event = new node_events.EventEmitter();
	}
	protected get state() {
		return this._state;
	}
	protected set state(state: StateHandler<State>["_state"]) {
		//
		// JavaScript suffers from common issue where cloning an object only clones its reference, not its value
		//
		if (state === this._state) throw new ReferenceError("shallow-copy is not allowed");

		const callback = new StateCallback<StateHandler<State>["_state"]>({ before: this._state, after: state });

		this._state = state;

		console.debug(callback);

		this._event.emit(this._UUID.toString(), callback);
	}
	public handle(callback: (state: StateCallback<StateHandler<State>["_state"]>) => void) {
		this._event.on(this._UUID.toString(), callback);
	}
}

export class StateCallback<State> {
	public readonly before: State;
	public readonly after: State;

	constructor(args: {
		before: StateCallback<State>["before"];
		after: StateCallback<State>["after"];
	}) {
		this.before = args.before;
		this.after = args.after;
	}
}

export class MappedStateHandler<Value> {
	private readonly _UUID: number;
	private _state: Value;
	private readonly _event: node_events.EventEmitter;

	constructor(args: {
		state: MappedStateHandler<Value>["_state"]
	}) {
		this._UUID = random(0, 6974, "double");
		this._state = args.state;
		this._event = new node_events.EventEmitter();
	}
	protected get state() {
		return this._state;
	}
	protected set state(state: MappedStateHandler<Value>["_state"]) {
		//
		// JavaScript suffers from common issue where cloning an object only clones its reference, not its value
		//
		if (this._state === state) throw new ReferenceError("shallow-copy is not allowed");

		this._state = state;

		this._event.emit(this._UUID.toString(), null);
	}
	public modify(key: keyof MappedStateHandler<Value>["_state"], value: Nullable<Value[keyof Value]>, extension?: (unsafe: MappedStateHandler<Value>["_state"]) => void) {
		//
		// JavaScript suffers from common issue where cloning an object only clones its reference, not its value
		//
		if (this._state[key] === value) throw new ReferenceError("shallow-copy is not allowed");

		const callback = new MappedStateCallback<Value>({ key: key, value: value, state: this._state });

		if (value === null) {
			delete this._state[key];
		} else {
			this._state[key] = value;
		}
		extension?.(this._state);

		console.debug(callback);

		this._event.emit(this._UUID.toString(), callback);
	}
	/**
	 * **WARNING**: use modify() instead, if possible
	 */
	public notify(key: keyof MappedStateHandler<Value>["_state"], value: Nullable<Value[keyof Value]>) {
		//
		// nested objects may want to share same instance but still informs property changes
		//
		const callback = new MappedStateCallback<Value>({ key: key, value: value, state: this._state });

		console.debug(callback);

		this._event.emit(this._UUID.toString(), callback);
	}
	public handle(callback: (state: MappedStateCallback<Value>) => void) {
		this._event.on(this._UUID.toString(), callback);
	}
}

export class MappedStateCallback<Value> {
	public readonly key: keyof MappedStateHandler<Value>["_state"];
	public readonly value: Nullable<Value[keyof Value]>;
	public readonly state: MappedStateHandler<Value>["_state"];

	constructor(args: {
		key: MappedStateCallback<Value>["key"];
		value: MappedStateCallback<Value>["value"];
		state: MappedStateCallback<Value>["state"];
	}) {
		this.key = args.key;
		this.value = args.value;
		this.state = args.state;
	}
}
