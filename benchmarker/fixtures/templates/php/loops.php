<?php if (!function_exists('e')) { function e ($value) { return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8'); } } ?>
<ul class="products">
  <?php foreach ($products as $product) { ?>
    <li class="product" data-id="<?= e($product->id) ?>">
      <h3><?= e($product->name) ?></h3>
      <p class="price"><?= e($product->price) ?></p>
      <p class="desc"><?= e($product->description) ?></p>
      <p class="rating"><?= e($product->rating) ?></p>
      <?php if ($product->inStock) { ?>
        <span class="stock in">In stock</span>
      <?php } else { ?>
        <span class="stock out">Out of stock</span>
      <?php } ?>
      <?php if ($product->onSale) { ?>
        <span class="sale">On sale</span>
      <?php } ?>
      <ul class="tags">
        <?php foreach ($product->tags as $tag) { ?>
          <li><?= e($tag->label) ?></li>
        <?php } ?>
      </ul>
    </li>
  <?php } ?>
</ul>
