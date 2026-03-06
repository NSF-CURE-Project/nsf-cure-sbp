import test from 'node:test';
import assert from 'node:assert/strict';

const loadAuthRoutes = async () =>
  import(`../../src/lib/routes/authRoutes.ts?cacheBust=${Date.now()}-${Math.random()}`);

const loadSeo = async () => import(`../../src/lib/seo.ts?cacheBust=${Date.now()}-${Math.random()}`);

test('auth and personal route guards cover key student flows', async () => {
  const { isAuthRoute, isPersonalRoute, shouldHideSidebar } = await loadAuthRoutes();

  assert.equal(isAuthRoute('/login'), true);
  assert.equal(isAuthRoute('/register/success'), true);
  assert.equal(isPersonalRoute('/profile'), true);
  assert.equal(isPersonalRoute('/join-classroom/invite'), true);
  assert.equal(shouldHideSidebar('/classes/statics'), false);
});

test('metadata builder creates canonical and noindex flags', async () => {
  const { buildMetadata } = await loadSeo();

  const metadata = buildMetadata({
    title: 'Lesson 1',
    description: 'Intro lesson',
    path: '/classes/statics/lessons/lesson-1',
    noIndex: true,
  });

  assert.equal(metadata.title, 'Lesson 1');
  assert.equal(metadata.alternates?.canonical?.includes('/classes/statics/lessons/lesson-1'), true);
  assert.equal(metadata.robots?.index, false);
});
