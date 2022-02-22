declare const api: {
  addButtonToToolbar(config: {
    title: string,
    shortcut: string,
    icon: string,
    action(): any
  }): any
}

console.log("Hello");

api.addButtonToToolbar({
  title: "Test",
  icon: "calendar",
  shortcut: "alt+r",
  action: () => alert('Uh oh!')
})