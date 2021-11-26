// modules
import storage from "@/modules/storage";
// states
import { MappedStateHandler } from "@/states";

class Bookmark extends MappedStateHandler<Record<number, boolean>> {
	public get state() {
		return super.state;
	}
	public set state(state: Bookmark["_state"]) {
		super.state = state;
		// update
		storage.state["bookmark"].state = Object.keys(super.state);
	}
	public add(id: number) {
		this.modify(id, true, (unsafe) => {
			
			storage.state["bookmark"].state = Object.keys(super.state);
		});
	}
	public remove(id: number) {
		this.modify(id, null, (unsafe) => {
			// update
			storage.state["bookmark"].state = Object.keys(super.state);
		});
	}
	public switch(id: number) {
		if (this.state[id]) {
			this.remove(id);
		} else {
			this.add(id);
		}
	}
}

const singleton = new Bookmark({
	state: (storage.state["bookmark"].state as Array<number>).reduce((array, value) => (array[value] = true, array), {} as Bookmark["_state"])
});

export default singleton;
