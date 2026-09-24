<?php if (!function_exists('e')) { function e ($value) { return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8'); } } ?>
<article class="post">
  <h1><?= e($page->title) ?></h1>
  <p class="breadcrumb"><?= e($page->breadcrumb) ?></p>
  <h2><?= e($page->heading) ?></h2>
  <p class="tagline"><?= e($site->tagline) ?></p>
  <p class="desc"><?= e($page->description) ?></p>
  <p class="escaped"><?= e($page->unsafe) ?></p>
  <div class="blurb"><?= $page->blurb ?></div>
  <dl class="meta">
    <dt>Site</dt><dd><?= e($site->name) ?></dd>
    <dt>URL</dt><dd><?= e($site->url) ?></dd>
    <dt>Support</dt><dd><?= e($site->supportEmail) ?></dd>
    <dt>Updated</dt><dd><?= e($page->updated) ?></dd>
    <dt>User</dt><dd><?= e($user->name) ?></dd>
    <dt>Email</dt><dd><?= e($user->email) ?></dd>
    <dt>Plan</dt><dd><?= e($user->plan) ?></dd>
    <dt>Unread</dt><dd><?= e($user->unreadCount) ?></dd>
    <dt>Greeting</dt><dd><?= e($user->greeting) ?></dd>
    <dt>Last seen</dt><dd><?= e($user->lastSeen) ?></dd>
    <dt>Copyright</dt><dd><?= e($site->copyright) ?></dd>
    <dt>Note</dt><dd><?= e($footer->note) ?></dd>
    <dt>Year</dt><dd><?= e($footer->year) ?></dd>
  </dl>
  <p class="signoff"><?= e($user->greeting) ?>, <?= e($user->name) ?> — you have <?= e($user->unreadCount) ?> unread messages from <?= e($site->name) ?>.</p>
  <footer class="post-footer"><?= e($site->name) ?> — <?= e($site->tagline) ?> — <?= e($site->supportEmail) ?> — <?= e($footer->year) ?></footer>
</article>
