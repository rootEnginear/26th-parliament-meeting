const el_dialog = document.getElementById('instruction-dialog');
const el_search_input = document.getElementById('search-input');
const el_search_btn = document.getElementById('search-btn');
const el_search_current = document.getElementById('search-current');
const el_search_all = document.getElementById('search-all');

const el_articles = Array.from(document.querySelectorAll('article'));
let highlighted_el = [];

const search_result_manager = {
	_all: null,
	_current: null,
	set current(index) {
		if (index > this._all) return;
		this._current = index;
		el_search_current.innerText = index + 1;
		highlighted_el[index].scrollIntoView();
	},
	get current() {
		return this._current;
	},
	set all(length) {
		this._all = length;
		this.current = 0;
		el_search_all.innerText = length;
	},
	get all() {
		return this._all;
	},
	get setResult() {
		return (length) => {
			if (length) return (this.all = length);
			this._current = null;
			this._all = null;
			el_search_current.innerText = 0;
			el_search_all.innerText = 0;
		};
	},
	get focus() {
		return () => {
			if (this._current == null) return;
			highlighted_el[this._current].scrollIntoView();
		};
	},
	get prev() {
		return () => {
			if (this._current == null) return;
			this.current = (this.current - 1 + this.all) % this.all;
		};
	},
	get next() {
		return () => {
			if (this._current == null) return;
			this.current = (this.current + 1) % this.all;
		};
	}
};

const goTop = () => {
	window.scrollTo(0, 0);
};

const goBottom = () => {
	window.scrollTo(0, document.body.scrollHeight);
};

const showInstruction = () => {
	el_dialog?.showModal();
};

const markArticles = (event) => {
	if (event.type === 'keydown' && event.key !== 'Enter') return;
	let i, j;
	el_search_btn.innerText = '...';
	const tokenized_search_list = [
		...new Set(
			el_search_input.value
				.split(' ')
				.map((e) => e.replace(/_/g, ' ').replace(/\\ /g, '_').trim())
				.filter((e) => e)
		)
	];

	const some = [];
	const must = [];
	const no = [];

	for (i = 0; i < tokenized_search_list.length; i++) {
		const term = tokenized_search_list[i];
		if (term[0] === '+') {
			must.push(term.substring(1));
		} else if (term[0] === '-') {
			no.push(term.substring(1));
		} else {
			some.push(term);
		}
	}

	highlighted_el.forEach((e) => e.classList.remove('highlight'));
	highlighted_el = [];

	if (some.length + must.length + no.length !== 0) {
		article_loop: for (i = 0; i < el_articles.length; i++) {
			const content = el_articles[i].textContent;
			for (j = 0; j < no.length; j++) {
				if (content?.includes(no[j])) continue article_loop;
			}
			for (j = 0; j < must.length; j++) {
				if (!content?.includes(must[j])) continue article_loop;
			}
			for (j = 0; j < some.length; j++) {
				if (content?.includes(some[j])) break;
			}
			if (j === some.length) continue article_loop;

			el_articles[i].classList.add('highlight');
			highlighted_el.push(el_articles[i]);
		}
	}

	search_result_manager.setResult(highlighted_el.length);

	if (window.requestIdleCallback) {
		return window.requestIdleCallback(() => {
			el_search_btn.innerText = 'ค้นหา';
		});
	}
	return setTimeout(() => {
		el_search_btn.innerText = 'ค้นหา';
	}, 0);
};

const scrollCurrentIntoView = () => search_result_manager.focus();
const gotoPrevSearch = () => search_result_manager.prev();
const gotoNextSearch = () => search_result_manager.next();

el_search_input.addEventListener('keydown', markArticles);
el_search_btn.addEventListener('click', markArticles);

el_search_btn.innerText = 'ค้นหา';

Array.from(document.querySelectorAll('link[media="print"]')).forEach((l) => (l.media = 'all'));

el_search_input.disabled = false;
el_search_btn.disabled = false;
document.getElementById('prev-btn').disabled = false;
document.getElementById('focus-btn').disabled = false;
document.getElementById('next-btn').disabled = false;
document.getElementById('howto-btn').disabled = false;
