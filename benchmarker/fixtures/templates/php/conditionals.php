<?php if (!function_exists('e')) { function e ($value) { return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8'); } } ?>
<div class="dashboard">
  <?php if ($user->loggedIn) { ?>
    <p class="hello">Welcome back, <?= e($user->name) ?>.</p>
  <?php } else { ?>
    <p class="hello">Please sign in.</p>
  <?php } ?>
  <?php if ($user->admin) { ?>
    <p class="role">You have admin access.</p>
  <?php } elseif ($user->editor) { ?>
    <p class="role">You can edit the catalog.</p>
  <?php } else { ?>
    <p class="role">You have read-only access.</p>
  <?php } ?>
  <?php if (!$flags->beta) { ?>
    <p class="channel">You are on the stable release.</p>
  <?php } else { ?>
    <p class="channel">You are on the beta release.</p>
  <?php } ?>
  <?php if ($flags->darkMode && $flags->showBanner) { ?>
    <div class="banner dark">Dark mode banner</div>
  <?php } else { ?>
    <div class="banner light">Light mode banner</div>
  <?php } ?>
  <?php if ($flags->compact) { ?>
    <p class="density">Compact layout</p>
  <?php } else { ?>
    <p class="density">Comfortable layout</p>
  <?php } ?>
  <?php if ($flags->newCheckout) { ?>
    <p class="checkout">New checkout enabled</p>
  <?php } else { ?>
    <p class="checkout">Legacy checkout</p>
  <?php } ?>
  <?php if ($user->unreadCount) { ?>
    <p class="unread">You have <?= e($user->unreadCount) ?> unread messages.</p>
  <?php } else { ?>
    <p class="unread">Nothing unread.</p>
  <?php } ?>
  <p class="access" data-role="<?= $user->admin ? 'admin' : 'member' ?>">Access level.</p>
</div>
