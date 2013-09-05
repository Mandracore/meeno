var meenoAppCli     = meenoAppCli || {};
meenoAppCli.l18n = meenoAppCli.l18n || {};

// shortcuts for people speaking English in Canada
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