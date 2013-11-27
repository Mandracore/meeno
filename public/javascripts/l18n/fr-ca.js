var meenoAppCli     = meenoAppCli || {};
meenoAppCli.l18n = meenoAppCli.l18n || {};

// shortcuts for people speaking French in France
meenoAppCli.l18n.EditorBodyView = {
	keyboardEvents: {
		// some issue with mousetrap on chrome
		// '#': 'newTag',
		// '@': 'newEntity',
		'ctrl+alt+shift+h': 'newTag',
		'ctrl+alt+shift+a': 'newEntity',
		'ctrl+alt+shift+t': 'newTask'
	}
};
meenoAppCli.l18n.BrowserBodyView = {
	keyboardEvents: {
		// some issue with mousetrap on chrome
		// '#': 'newTag',
		// '@': 'newEntity',
		'ctrl+alt+shift+h': 'newTag',
		'ctrl+alt+shift+a': 'newEntity',
		'ctrl+alt+shift+t': 'newTask'
	}
};