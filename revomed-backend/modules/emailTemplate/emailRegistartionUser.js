let template = (text) => {
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
                  <td><center><img src="https://revomed.ru/public/img/Revomed.png"></center></td>
                </tr>
              </thead>
            </table>
            <table style="padding: 3em;">
              <tbody>
                <tr>
                </tr>
                <tr>
                  <td>
                    <p style="color: #9B9BAB; font-weight: 300; margin: 2em 0;">` + text + `</p>
                  </td>
                </tr>
                <tr>
                  <td><a href="https://dev.unicreate.ru:3000/lk" style="color: #ffffff; padding: .75em 1.5em; display: inline-block; background-color: #6D71F9; border-radius: 50px; text-decoration: none; margin-bottom: 3.5em">Перейти в личный кабинет</a></td>
                </tr>
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