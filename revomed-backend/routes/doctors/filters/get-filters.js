// get filters in catalog
const express = require('express');
const router = express.Router();
const {DateTime} = require('luxon');

const Category = require('../../../models/Categories.js');

router.get('/doctors/filters', (req, res, next) => {
	let categories = [];
	let sort = [
	{
		value: 'popular',
		name: 'Популярное'
	},
	{
		value: 'bestRating',
		name: 'Лучший рейтинг'
	},
	{
		value: 'priceUp',
		name: 'Низкая цена'
	},
	{
		value: 'priceDown',
		name: 'Высокая цена'
	},
	{
		value: 'experience',
		name: 'Стаж'
	}]
	let filter = [
		{
			value: 0,
			name: 'Без фильтров'
		},
		{
			value: 'male',
			name: 'Только мужчины'
		},
		{
			value: 'female',
			name: 'Только женщины'
		}
	]
	let date = [
		{
			value: "0",
			name: "Дата приема"
		},
		{
			value: DateTime.now().setZone(req.query.zone).toISO(),
			name: "Сегодня"
		}, 
		{
			value: DateTime.now().setZone(req.query.zone).plus({days: 1}).toISO(),
			name: "Завтра, " + DateTime.now().setZone(req.query.zone).plus({days: 1}).setLocale('ru').toFormat("d LLL")
		},
		{
			value: DateTime.now().setZone(req.query.zone).plus({days: 2}).toISO(),
			name: "Послезавтра, " + DateTime.now().setZone(req.query.zone).plus({days: 2}).setLocale('ru').toFormat("d LLL")
		},
		{
			value: DateTime.now().setZone(req.query.zone).plus({days: 3}).toISO(),
			name: DateTime.now().setZone(req.query.zone).plus({days: 3}).setLocale('ru').toFormat("cccc").charAt(0).toUpperCase() + DateTime.now().setZone(req.query.zone).plus({days: 3}).setLocale('ru').toFormat("cccc").slice(1) + ", " + DateTime.now().setZone(req.query.zone).plus({days: 3}).setLocale('ru').toFormat("d LLL")
		},
	]
	let time = [
	{
		value: "0",
		name: "Любое время"
	},
	{
		value: "9-10",
		name: "9:00 - 10:00"
	},
	{
		value: "10-12",
		name: "10:00 - 12:00"
	},
	{
		value: "12-17",
		name: "12:00 - 17:00"
	},
	{
		value: "17-22",
		name: "17:00 - 22:00"
	},
	{
		value: "22-24",
		name: "22:00 - 00:00"
	},
	{
		value: "0-5",
		name: "0:00 - 5:00"
	},
	{
		value: "5-9",
		name: "5:00 - 9:00"
	}]

	Category.model.find().exec((err, items) => {
		items.forEach((item) => {
			let category = {
				name: item.nameRu,
				value: item.name,
			}
			categories.push(category)
		});
		return res.send({success: true, filters: {categories: categories, time: time, sort: sort, date: date, filter: filter}});
	});
});

module.exports = router;