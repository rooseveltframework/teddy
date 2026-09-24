<header class="masthead">
  <p class="brand"><?= e($site->name) ?></p>
  <p class="tagline"><?= e($site->tagline) ?></p>
  <nav>
    <ul>
      <?php foreach ($nav as $item) { ?>
        <li class="nav-item"><a href="<?= e($item->href) ?>" <?php if ($item->current) { ?>aria-current="page"<?php } else { ?>class="plain"<?php } ?>><?= e($item->label) ?></a></li>
      <?php } ?>
    </ul>
  </nav>
  <?php if ($user->loggedIn) { ?>
    <p class="session"><?= e($user->greeting) ?>, <?= e($user->name) ?>.</p>
  <?php } else { ?>
    <p class="session">Sign in to see your orders.</p>
  <?php } ?>
</header>
