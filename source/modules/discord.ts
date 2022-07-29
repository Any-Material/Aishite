import RPC from "discord-rpc";

/** @see https://discord.com/developers/docs/rich-presence/how-to */
class RichPresence {
	readonly state?: string;
	readonly details?: string;
	readonly largeImageKey?: string;
	readonly largeImageText?: string;
	readonly smallImageKey?: string;
	readonly smallImageText?: string;
	readonly primaryButton?: {
		readonly label: string;
		readonly url: string;
	};
	readonly secondaryButton?: {
		readonly label: string;
		readonly url: string;
	};
	readonly partyId?: string;
	readonly partyMax?: number;
	readonly partySize?: number;
	readonly joinSecret?: string;
	readonly matchSecret?: string;
	readonly spectateSecret?: string;
	readonly startTimestamp?: number;
	readonly endTimestamp?: number;
	readonly instance?: boolean;

	constructor(args: Args<RichPresence>) {
		this.state = args.state;
		this.details = args.details;
		this.largeImageKey = args.largeImageKey;
		this.largeImageText = args.largeImageText;
		this.smallImageKey = args.smallImageKey;
		this.smallImageText = args.smallImageText;
		this.primaryButton = args.primaryButton;
		this.secondaryButton = args.secondaryButton;
		this.partyId = args.partyId;
		this.partyMax = args.partyMax;
		this.partySize = args.partySize;
		this.joinSecret = args.joinSecret;
		this.matchSecret = args.matchSecret;
		this.spectateSecret = args.spectateSecret;
		this.startTimestamp = args.startTimestamp;
		this.endTimestamp = args.endTimestamp;
		this.instance = args.instance;
	}
	public toJSON() {
		// cache
		const buttons = [this.primaryButton, this.secondaryButton].filter((button) => button);
		
		return {
			pid: process.pid,
			activity: {
				state: this.state,
				details: this.details,
				timestamps: {
					start: this.startTimestamp,
					end: this.endTimestamp
				},
				assets: {
					large_image: this.largeImageKey,
					large_text: this.largeImageText,
					small_image: this.smallImageKey,
					small_text: this.smallImageText,
				},
				party: {
					id: this.partyId,
					size: this.partySize && this.partyMax ? [this.partySize, this.partyMax] : undefined
				},
				buttons: buttons.isEmpty() ? undefined : buttons,
				secrets: buttons.isEmpty() ? { join: this.joinSecret, spectate: this.spectateSecret, match: this.matchSecret } : undefined,
				instance: this.instance
			}
		};
	}
}

class Discord {
	private _token: string;
	private _client: RPC.Client;
	private _activity: RichPresence;
	private _connection: boolean;

	constructor(state: RichPresence, token: string) {
		this._token = token;
		this._client = new RPC.Client({ transport: "ipc" });
		this._activity = state;
		this._connection = false;

		until(() => this._client !== null).then(() => {
			// attach before create
			this._client.on("ready", () => {
				// update
				this._connection = true;
				// @ts-ignore
				this._client.transport.socket.on("close", () => {
					// update
					this._connection = false;
					// recreate
					this.create()
					// reconnect
					this.connect();
				});
			});
			// connect
			this.connect();
		});
	}
	public update(activity: Args<RichPresence> = this._activity, override: boolean = false) {
		// conditional override
		this._activity = new RichPresence(override ? activity : { ...this._activity, ...activity });
		// @ts-ignore
		until(() => this._connection).then(() => this._client.request("SET_ACTIVITY", this._activity.toJSON()));
	}
	protected create() {
		// just in case
		this._client?.destroy();
		// assign
		this._client = new RPC.Client({ transport: "ipc" });
	}
	protected connect() {
		// prevent multiple connections
		if (this._connection) throw new Error();
		// CONNECTING HEART! - DCINSIDE
		this._client.login({ clientId: this._token }).then(() => this.update()).catch(() => setTimeout(() => this.connect(), 1000 * 60));
	}
}

const singleton = new Discord(
	new RichPresence({
		// lore
		details: "Starting...",
		// large image
		largeImageKey: "icon",
		largeImageText: "Strawberry Flavour",
		// small image
		smallImageKey: "discord",
		smallImageText: "it's gone...",
		// buttons
		primaryButton: {
			label: "Get Aishite for FREE!",
			url: "https://github.com/Any-Material/Aishite"
		},
		// time elapsed
		startTimestamp: Date.now()
	}),
	"1002386178055614474"
);

export default singleton;
