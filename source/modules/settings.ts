// assets
import template from "@/assets/config.json";
// modules
import storage from "@/modules/storage";
// states
import { StateHandler } from "@/states";

export class Settings extends StateHandler<Config> {
	constructor(args: {
		state: Config
	}) {
		super(args);
		
		storage.state["config"].state = super.state as Record<string, any>;
	}
	public get state() {
		return super.state;
	}
	public set state(state: Config) {
		super.state = state;
		storage.state["config"].state = super.state as Record<string, any>;
	}
}

export class Config {
	public app: {
		requires: Array<string>;
	};
	public search: {
		query: string;
		limit: number;
	};
	public storage: {
		period: number;
	};
	public download: {
		directory: string;
		placeholder: string;
		max_threads: number;
		max_working: number;
	};
	public lazyload: {
		retry: number;
	};
	public gallery: {
		resolution: "lowest";
		censorship: boolean;
		discovery: string[];
	};
	public paging: {
		metre: number;
	};

	constructor(args: {
		app: Config["app"];
		search: Config["search"];
		storage: Config["storage"];
		download: Config["download"];
		lazyload: Config["lazyload"];
		gallery: Config["gallery"];
		paging: Config["paging"];
	}) {
		this.app = args.app;
		this.search = args.search;
		this.storage = args.storage;
		this.download = args.download;
		this.lazyload = args.lazyload;
		this.gallery = args.gallery;
		this.paging = args.paging;
	}
}

export default (
	//
	// singleton
	//
	new Settings({
		state: new Config({
			app:		(storage.state["config"].state as Record<string, any> as Config).app		?? template.app,
			search:		(storage.state["config"].state as Record<string, any> as Config).search		?? template.search,
			storage:	(storage.state["config"].state as Record<string, any> as Config).storage	?? template.storage,
			download:	(storage.state["config"].state as Record<string, any> as Config).download	?? template.download,
			lazyload:	(storage.state["config"].state as Record<string, any> as Config).lazyload	?? template.lazyload,
			gallery:	(storage.state["config"].state as Record<string, any> as Config).gallery	?? template.gallery,
			paging:		(storage.state["config"].state as Record<string, any> as Config).paging		?? template.paging
		})
	})
)
