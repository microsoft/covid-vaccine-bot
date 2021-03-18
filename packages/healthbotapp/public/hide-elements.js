function hideElement(element) {
	element.classList.add('hidden')
}

function alreadyListening(element) {
	return element.classList.contains('alreadyListening')
}

function listening(element) {
	element.classList.add('alreadyListening')
}

function hideOnEnter(element) {
	// Don't re-add event listener to elements
	// and don't add event listener to the default webchat sendbox.
	if(alreadyListening(element) || element.classList.contains('webchat__send-box-text-box__input')) return;
	element.addEventListener('keypress', function(ev) {
		if(ev.key === 'Enter') {
			hideElement(element.parentElement)
		}
	})
	listening(element)
}

function hideOnClick(element) {
	if(alreadyListening(element)) return;
	element.addEventListener('click', function(ev) {
		hideElement(element.parentElement)
	})
	listening(element)
}

setInterval(() => {
	const inputElements = document.getElementsByTagName('input');
	inputElements.forEach(hideOnEnter);

	const buttonElements = document.getElementsByTagName('button');
	buttonElements.forEach(hideOnClick);
}, 100);
