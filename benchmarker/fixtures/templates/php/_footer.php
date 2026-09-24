<footer class="site-footer">
  <p class="note"><?= e($footer->note) ?></p>
  <ul class="footer-links">
    <?php foreach ($footer->links as $link) { ?>
      <li><a href="<?= e($link->href) ?>"><?= e($link->label) ?></a></li>
    <?php } ?>
  </ul>
  <p class="copyright"><?= e($site->copyright) ?></p>
</footer>
