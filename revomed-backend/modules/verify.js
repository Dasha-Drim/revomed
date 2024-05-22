let OnlyLetters = /^[a-zA-Zа-яёА-ЯЁ]+$/;
let OnlyData = /^[0-9]{2}[.]{1}[0-9]{2}[.]{1}[0-9]{4}$/;
let OnlyNum = /^[0-9]+$/;
let OnlyEmail = /^[-0-9A-z\.]{1,}[@]{1}[-0-9A-z\.]{1,}[.]{1}[-A-Za-z]{2,}/;

let verifyDataDoctor = (data) => {
	if (!data.email.match(OnlyEmail)) return 'Неверный email';
	if (!data.experience.match(OnlyNum)) return 'В опыте работы вы должны указать только цифры';

	return false
}
let verifyDataClinic = (data) => {
	if (!data.managerEmail.match(OnlyEmail)) return 'Неверный email';
}
let verifyPrice = (data) => {
	if (!data.price.match(OnlyNum)) return 'Неверно указана стоимость.';
}
let verifySaleFixed = (data) => {
	if (!data.sale.match(OnlyNum)) return 'Неверно указана скидка.';
	if (+data.sale >= 100 || +data.sale <= 0) return 'Скидка может быть указана в диапазоне от 1% до 99%';
}
let verifySaleCumulative = (data) => {
	console.log("datadatadatadata", data)
	if (!data.minSale.match(OnlyNum)) return 'Неверно указана скидка.';
	if (+data.minSale >= 100 || +data.minSale <= 0) return 'Скидка может быть указана в диапазоне от 1% до 99%.';

	if (!data.maxSale.match(OnlyNum)) return 'Неверно указана скидка.';
	if (+data.maxSale >= 100 || +data.maxSale <= 0) return 'Скидка может быть указана в диапазоне от 1% до 99%.';

	if (!data.step.match(OnlyNum)) return 'Неверно указан шаг скидки.';
	if (+data.step >= 100 || +data.step <= 0) return 'Шаг скидки должен быть в диапазоне от от 1% до 99%.';

	if (!data.numConsultation.match(OnlyNum)) return 'Неверно указано значение номера консультации, после которой начинает действовать накопительная скидка.';
	if (+data.numConsultation < 0) return 'Номер консультации, после которой начинает действовать накопительная скидка, не может быть меньше 0.';

	if (+data.minSale > +data.maxSale) return 'Минимальная скидка не может быть больше первоначальной';
}
module.exports.verifyDataDoctor = verifyDataDoctor;
module.exports.verifyDataClinic = verifyDataClinic;
module.exports.verifyPrice = verifyPrice;
module.exports.verifySaleFixed = verifySaleFixed;
module.exports.verifySaleCumulative = verifySaleCumulative;