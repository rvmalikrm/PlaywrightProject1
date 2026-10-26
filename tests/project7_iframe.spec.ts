import {test, expect,Locator} from '@playwright/test';

test('Iframe Automation', async ({page}) =>
{
    await page.goto('https://app.thetestingacademy.com/playwright/frames/');
    await page.frameLocator('#frame-one').locator('#RESULT_TextField-1').fill('Test Practice for CAr REgistration');
   

    await page.frameLocator('#frame-one').locator('#RESULT_TextField-2').pressSequentially('Ravi Malik');
    await page.frameLocator('#frame-one').locator('#RESULT_TextField-3').fill('HR98E1234');
    await page.frameLocator('#frame-one').locator('#RESULT_RadioButton-1').selectOption('SUV');

    await page.frameLocator('#frame-one').locator('#RESULT_TextField-4').fill('2022');
    await page.frameLocator('#frame-one').locator('#RESULT_TextArea-1').fill('Ravi Has Magnite Car purchased in 2022 and the Nissan is the manufacturing company of the car');

    await page.frameLocator('#frame-one').locator('#vehicle-submit').click();
    await page.waitForTimeout(1000);

});