abstract class Style {
	/** please check Mozila Foundation before any implementation */
	protected abstract compile(): React.CSSProperties;
	/** @final */
	public toStyle(): React.CSSProperties {
		const style = this.compile();

		for (const key of Object.keys(style) as Array<keyof React.CSSProperties>) {
			if (style[key] === undefined) {
				delete style[key];
			}
		}
		return style;
	}
}

export default Style;
