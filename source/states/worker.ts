// modules
import storage from "@/modules/storage";
import { Task } from "@/modules/download";
// states
import { MappedStateHandler } from "@/states";

export class Worker extends MappedStateHandler<Record<number, Task>> {
	public get state() {
		return super.state;
	}
	/**
	 * @deprecated this function will **ALWAYS** throw an error
	 */
	public set state(state: Worker["_state"]) {
		//
		// getter and setter must share the same accessibility,
		// but since getter is public, so do the setter must be.
		// to prevent bulk define, this function will always throw error.
		//
		super.state = state;
	}
	public spawn(task: Worker["_state"][keyof Worker["_state"]]) {
		this.modify(task.id, task, (unsafe) => {
			// update
			storage.register(task.id.toString(), `./bundles/${task.id}.nozomi`, task);
		});
	}
	public despawn(task: Worker["_state"][keyof Worker["_state"]]) {
		this.modify(task.id, null, (unsafe) => {
			// update
			storage.unregister(task.id.toString());
		});
	}
}

export default (
	//
	// singleton
	//
	new Worker({
		state: {}
	})
)
