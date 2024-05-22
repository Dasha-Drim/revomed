const config = require('../../config/config.js');

let template = (name, login, password) => {
  let mail = `
    <!DOCTYPE html>
    <html lang="ru">
    <head>
      <title>письмо</title>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap" rel="stylesheet">
    </head>
    <body style="margin: 0; font-family: "Roboto";">
      <table style="max-width: 600px; width: 100%; margin: 0; padding: 0;" border="0" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <table style="background-color: #6D71F9; width: 100%; padding: 2em;">
              <thead class="head">
                <tr>
                  <td><center><img src="` + config.config.backend + `/public/img/Revomed.png"></center></td>
                </tr>
              </thead>
            </table>
            <table style="padding: 3em;">
              <tbody>
                <tr>
                  <td><span style="color: #9B9BAB; font-weight: 500;">` + name + `,</span></td>
                </tr>
                <tr>
                  <td>
                    <p style="color: #9B9BAB; font-weight: 300; margin: 2em 0;">Просим вас внимательно ознакомиться с содержимым данного письма!</p>
                    <p style="color: #9B9BAB; font-weight: 300; margin: 2em 0;">Огромное спасибо, что Вы присоединились к работе с нами! Время не стоит на месте и требует постоянных модернизаций и изменений. Что и происходит ежедневно с сервисом Revomed.ru. Мы полностью пересобрали его и сделали еще более удобным и безопасным.</p>
                    <p style="color: #9B9BAB; font-weight: 300; margin: 2em 0;">Самое главное, мы усилили защиту персональных данных на сервисе. В связи с этим мы вынуждены сбросить ваши старые пароли и автоматически сгенерировать новые, для каждого аккаунта врача и партнера.</p>
                    <p style="color: #9B9BAB; font-weight: 300; margin: 2em 0;">Обратите на это внимание. Вы будете работать с абсолютно новым продуктом.</p>
                    <p style="color: #9B9BAB; font-weight: 300; margin: 2em 0;">Ваш новый пароль: <b>` + password + `</b></p>
                    <p style="color: #9B9BAB; font-weight: 300; margin: 2em 0;">Ваш email: <b>` + login + `</b></p>
                    <p style="color: #9B9BAB; font-weight: 300; margin: 2em 0;">Также, изменились некоторые поля в редактировании профиля врача:</p>
                    <p style="color: #9B9BAB; font-weight: 300; margin: 2em 0;">1. Период образования и опыта работы теперь в обязательном порядке вводятся по формату "месяц/год". Если у вас был заполнен только год, он теперь будет отображаться как первый месяц указанного года. Не забудьте обновить информацию.</p>
                    <p style="color: #9B9BAB; font-weight: 300; margin: 2em 0;">2. Поле "Основные специализации" теперь ограничено 6 пунктами, в котором каждый пункт не может быть длиннее 30 символов. Нам пришлось оставить только подходящие под критерии пункты. Вы можете изменить их через "Редактирование профиля" в личном кабинете.</p>
                  </td>
                </tr>                
                <tr>
                  <td><a href="` + config.config.frontend + `/auth/sellers" style="color: #ffffff; padding: .75em 1.5em; display: inline-block; background-color: #6D71F9; border-radius: 50px; text-decoration: none; margin-bottom: 3.5em">Перейти в личный кабинет</a></td>
                </tr>

                <tr>
                  <td><span style="color: #9B9BAB; font-weight: 300; margin-bottom: 1.3em; display: inline-block;">Спасибо большое за ваше внимание и веру!</span></td>
                </tr>
                <tr>
                  <td><span style="color: #9B9BAB; font-weight: 300; margin-bottom: 1.3em; display: inline-block;">Это очень ценно для нас. Мы постараемся оправдать ваши ожидания.</span></td>
                </tr>
                <tr>
                  <td><span style="color: #9B9BAB; font-weight: 300; margin-bottom: 1.3em; display: inline-block;">С уважением, команда Revomed.</span></td>
                </tr>
                <tr>
                  <td><span style="color: #9B9BAB; font-weight: 300;">По вопросам писать: <a href = "mailto: info@revomed.ru" style="color: #6D71F9; font-weight: 500; text-decoration: none;">info@revomed.ru</a></span></td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>`;
  return mail;
}
module.exports.template = template;