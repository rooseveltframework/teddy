<?php if (!function_exists('e')) { function e ($value) { return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8'); } } ?>
<div class="shell">
  <?php include '_header.php' ?>
  <ul class="products">
    <?php foreach ($products as $product) { ?>
      <?php include '_product.php' ?>
    <?php } ?>
  </ul>
  <?php include '_footer.php' ?>
</div>
