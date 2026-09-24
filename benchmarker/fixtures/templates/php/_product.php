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
  <ul class="tags">
    <?php foreach ($product->tags as $tag) { ?>
      <li><?= e($tag->label) ?></li>
    <?php } ?>
  </ul>
</li>
