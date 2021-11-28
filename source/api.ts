export enum API_COMMAND {
	CLOSE				= "close",
	FOCUS				= "focus",
	BLUR				= "blur",
	MINIMIZE			= "minimize",
	MAXIMIZE			= "maximize",
	UNMAXIMIZE			= "unmaximize",
	FULLSCREEN			= "fullscreen",
	DIRECTORY			= "directory",
	PACKAGED			= "packaged"
}

export enum BridgeEvent {
	CLOSE				= "close",
	FOCUS				= "focus",
	BLUR				= "blur",
	MINIMIZE			= "minimize",
	MAXIMIZE			= "maximize",
	UNMAXIMIZE			= "unmaximize",
	ENTER_FULL_SCREEN	= "enter-full-screen",
	LEAVE_FULL_SCREEN	= "leave-full-screen",
	TOGGLE_TERMINAL		= "toggle-terminal"
}
