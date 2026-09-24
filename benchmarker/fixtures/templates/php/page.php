<?php if (!function_exists('e')) { function e ($value) { return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8'); } } ?>
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title><?= e($page->title) ?> — <?= e($site->name) ?></title>
    <meta name="description" content="<?= e($page->description) ?>">
  </head>
  <body class="collection" data-theme="<?= $flags->darkMode ? 'dark' : 'light' ?>">
    <?php include '_header.php' ?>
    <main>
      <?php if ($flags->showBanner) { ?>
        <div class="banner">
          <div class="blurb"><?= $page->blurb ?></div>
        </div>
      <?php } ?>
      <h1><?= e($page->heading) ?></h1>
      <p class="breadcrumb"><?= e($page->breadcrumb) ?></p>
      <p class="desc"><?= e($page->description) ?></p>
      <?php if ($user->admin) { ?>
        <p class="role">You have admin access.</p>
      <?php } elseif ($user->editor) { ?>
        <p class="role">You can edit the catalog.</p>
      <?php } else { ?>
        <p class="role">You have read-only access.</p>
      <?php } ?>
      <ul class="products">
        <?php foreach ($products as $product) { ?>
          <?php include '_product.php' ?>
        <?php } ?>
      </ul>
      <table class="recent">
        <thead>
          <tr><th>ID</th><th>Name</th><th>Department</th><th>Tenure</th><th>Status</th></tr>
        </thead>
        <tbody>
          <?php foreach ($recent as $row) { ?>
            <tr>
              <td><?= e($row->id) ?></td>
              <td><?= e($row->name) ?></td>
              <td><?= e($row->department) ?></td>
              <td><?= e($row->tenure) ?></td>
              <td><?php if ($row->active) { ?>Active<?php } else { ?>Inactive<?php } ?></td>
            </tr>
          <?php } ?>
        </tbody>
      </table>
      <p class="updated">Last updated <?= e($page->updated) ?>.</p>
    </main>
    <?php include '_footer.php' ?>
  </body>
</html>
