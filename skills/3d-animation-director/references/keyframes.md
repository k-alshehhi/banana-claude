# Keyframes عبر Banana

تُقرأ عند اختيار المستخدم الصور الثابتة قبل التحريك. الصورة هي **الإطار الأول** للقطة، وتصير لاحقاً `start_image` لأداة الفيديو.

## الخطوات

1. **ورقة المرجع أولاً:** أمر واحد يعرض كل الشخصيات بالـ anchors حرفياً، من الأمام والجانب و3/4، على خلفية محايدة وإضاءة متساوية. هذي الصورة مرجع كل اللقطات.
2. **أمر لكل لقطة:** فقرة سردية من 100–200 كلمة بصيغة banana الخماسية (subject, action, location, composition, style). اكتب الحدث **كلحظة متجمدة** ("caught mid-air", "stands at the edge")، وانقل حجم اللقطة والعدسة من الـ storyboard كما هي.
3. **التنفيذ:** `/banana generate` بنسبة 16:9 للسينمائي أو 9:16 للعمودي، دقة `2K`. في كل لقطة أرفق ورقة المرجع وابدأ الأمر بـ `Use the attached character sheet for <names> exactly.`

**تنتهي المهمة** عندما يكون عندك أمر لورقة المرجع + أمر لكل لقطة، كلها تحمل الـ anchors حرفياً، ونسبة الأبعاد محددة.

## حاجز صارم
استخدم مراسي المكانة (prestige anchors) من `banana` مثل "a frame from a feature-length animated film" للجودة. الكلمات المحظورة في banana ("8K", "masterpiece", "ultra-realistic", "high resolution") تضعف الصورة ولا تدخل أي أمر.
