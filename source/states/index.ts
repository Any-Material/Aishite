// nodejs
import { EventEmitter } from "events";

export class StateHandler<State> {
	private _state: State;
	private readonly _UUID: number;
	private readonly _event: EventEmitter;

	constructor(args: { state: StateHandler<State>["_state"] }) {
		this._state = args.state;
		this._UUID = random(0, 6974);
		this._event = new EventEmitter();

		this.create();
	}
	protected get state() {
		return this._state;
	}
	protected set state(state: StateHandler<State>["_state"]) {
		//
		// JavaScript suffers from common issue where cloning an object only clones its reference, not its value
		//
		if (state === this._state) throw new ReferenceError("Shallow-copy is not allowed");

		const callback = new StateCallback<StateHandler<State>["_state"]>({ before: this._state, after: state });

		this._state = state;

		console.debug(callback);

		this._event.emit(this._UUID.toString(), callback);
	}
	protected create(): void {
		console.debug("This class has default class constructor");
	}
	public handle(callback: (state: StateCallback<StateHandler<State>["_state"]>) => void) {
		this._event.on(this._UUID.toString(), callback);
	}
}

class StateCallback<State> {
	public readonly before: State;
	public readonly after: State;

	constructor(args: StateCallback<State>) {
		this.before = args.before;
		this.after = args.after;
	}
}

export class MappedStateHandler<Value> {
	private _state: Value;
	private readonly _UUID: number;
	private readonly _event: EventEmitter;

	constructor(args: { state: MappedStateHandler<Value>["_state"] }) {
		this._state = args.state;
		this._UUID = random(0, 6974);
		this._event = new EventEmitter();

		this.create();
	}
	protected get state() {
		return this._state;
	}
	protected set state(state: MappedStateHandler<Value>["_state"]) {
		//
		// JavaScript suffers from common issue where cloning an object only clones its reference, not its value
		//
		if (this._state === state) throw new ReferenceError("Shallow-copy is not allowed");

		this._state = state;

		this._event.emit(this._UUID.toString(), null);
	}
	protected create(): void {
		console.debug("This class has default class constructor");
	}
	public modify(key: keyof MappedStateHandler<Value>["_state"], value: Nullable<Value[keyof Value]>, extension?: (unsafe: MappedStateHandler<Value>["_state"]) => void) {
		//
		// JavaScript suffers from common issue where cloning an object only clones its reference, not its value
		//
		if (this._state[key] === value) throw new ReferenceError("Shallow-copy is not allowed");

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
	//
	// **WARNING**: use modify() instead, if possible
	//
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

class MappedStateCallback<Value> {
	public readonly key: keyof MappedStateHandler<Value>["_state"];
	public readonly value: Nullable<Value[keyof Value]>;
	public readonly state: MappedStateHandler<Value>["_state"];

	constructor(args: MappedStateCallback<Value>) {
		this.key = args.key;
		this.value = args.value;
		this.state = args.state;
	}
}
