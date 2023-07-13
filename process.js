import fs from 'fs';
import jsdom from 'jsdom';
const { JSDOM } = jsdom;
import raw_data from './src/data/all_raw.json' assert { type: 'json' };

const formatString = (str) => {
	return str
		.replace(/๐/g, '0')
		.replace(/๑/g, '1')
		.replace(/๒/g, '2')
		.replace(/๓/g, '3')
		.replace(/๔/g, '4')
		.replace(/๕/g, '5')
		.replace(/๖/g, '6')
		.replace(/๗/g, '7')
		.replace(/๘/g, '8')
		.replace(/๙/g, '9')
		.replace(/\u00a0/g, ' ')
		.replace(/\u2013/g, '-')
		.replace(/\\t/g, ' ')
		.replace(/\u201c/g, '"')
		.replace(/\u201d/g, '"')
		.replace(/\s+/g, ' ')
		.trim();
};

const formatTitle = (str) => {
	if (
		[
			'เรื่องด่วน',
			'เรื่องที่คณะกรรมาธิการพิจารณาเสร็จแล้ว',
			'กระทู้ถามสดด้วยวาจา',
			'กระทู้ถามทั่วไป',
			'กระทู้ถามแยกเฉพาะ',
			'รับรองรายงานการประชุม',
			'เรื่องที่ที่ประชุมเห็นชอบให้เลื่อนขึ้นมาพิจารณาก่อน',
			'เรื่องที่ค้างพิจารณา',
			'เรื่องที่ประธานจะแจ้งต่อที่ประชุม',
			'เรื่องที่ประธานแจ้งให้ที่ประชุมรับทราบ',
			'เรื่องที่ประธานแจ้งต่อที่ประชุม',
			'ระเบียบวาระที่ 7 เรื่องอื่น ๆ',
			'ระเบียบวาระที่ 6 เรื่องอื่น ๆ',
			'ระเบียบวาระที่ 5 เรื่องที่เสนอใหม่',
			'ระเบียบวาระที่ 5 เรื่องที่ค้างพิจารณา',
			'ระเบียบวาระที่ 4 เรื่องที่คณะกรรมาธิการพิจารณาเสร็จแล้ว',
			'ระเบียบวาระที่ 3 เรื่องที่คณะกรรมาธิการพิจารณาเสร็จแล้ว',
			'ระเบียบวาระที่ 2 รับรองรายงานการประชุม',
			'เรื่องต่าง ๆ',
			'เรื่องอื่น ๆ',
			'เรื่องอื่นๆ',
			'ระเบียบวาระเรื่องด่วน',
			'ระเบียบวาระกระทู้ถามสดด้วยวาจา',
			'ระเบียบวาระกระทู้ถามทั่วไป',
			'ระเบียบวาระกระทู้ถามแยกเฉพาะ'
		].includes(str)
	)
		return `<strong>${str}</strong>`;
	return str;
};

const process = () => {
	let data = [];
	for (let entry in raw_data) {
		const { document } = new JSDOM(raw_data[entry]).window;

		//  1. ชุดเท่าไร ปีไหน สมัยไหน — อยู่ที่ `table > tbody > tr:nth-child(2)`
		const category = formatString(
			document.querySelector('table > tbody > tr:nth-child(2)').textContent
		);

		// 2. ครั้งที่ วันที่ เวลา — อยู่ที่ `table > tbody > tr:nth-child(3)`
		const no = formatString(document.querySelector('table > tbody > tr:nth-child(3)').textContent);

		// 3. เรื่องที่พิจารณา — อยู่ที่ `#mydetail > td:first-of-type`
		const title = formatString(
			document
				.querySelector('#mydetail > td:first-of-type')
				.innerHTML.replace(/<div.*?>/g, '\n')
				.replace(/<\/div>/g, '\n')
				.replace(/<p.*?>/g, '\n')
				.replace(/<\/p>/g, '\n')
				.replace(/<br.*?>/g, '\n')
				.replace(/\n\n/g, '\n')
				.replace(/<.*?>/g, '') // Remove other tags
				.replace(/<\/.*?>/g, '') // Remove other tags
				.replace(/&nbsp;/g, ' ')
				.replace(/\n/g, '<br>')
		)
			.split('<br>')
			.map((e) => formatTitle(e.trim()))
			.filter((s) => s);

		// 4. ใบประมวลผลการลงมติ — อยู่ที่ `#mydetail_o > td > ul > li > a[target]`
		const score_summary_docs = [...document.querySelectorAll('#mydetail_o > td > ul > li')].map(
			(el) => {
				const hasLink = el.querySelector('a[target]');
				if (hasLink)
					return [
						formatString(hasLink.textContent),
						(
							'https://msbis.parliament.go.th/ewtadmin/ewt/parliament_report/' +
							hasLink.href.replace('../parliament_report/', '')
						).trim()
					];
				return formatString(el.textContent);
			}
		);

		// 5. ข้อมูลการประชุม — อยู่ที่ `table > tbody > tr > td > a[target]`
		const meeting_docs = [...document.querySelectorAll('table > tbody > tr > td > a[target]')].map(
			(el) => [
				formatString(el.textContent),
				('https://msbis.parliament.go.th/ewtadmin/ewt/parliament_report/' + el.href).trim()
			]
		);

		data.push({
			id: entry,
			category,
			no,
			title,
			score_summary_docs,
			meeting_docs
		});
	}

	data = data.sort((a, z) => z.id - a.id);

	let formatted_data = JSON.stringify(data);

	fs.writeFileSync('src/data/all_parsed.json', formatted_data);
};
process();
