<?php if (!function_exists('e')) { function e ($value) { return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8'); } } ?>
<table class="roster">
  <thead>
    <tr><th>ID</th><th>Name</th><th>Email</th><th>Department</th><th>Title</th><th>Tenure</th><th>Status</th></tr>
  </thead>
  <tbody>
    <?php foreach ($rows as $row) { ?>
      <tr>
        <td><?= e($row->id) ?></td>
        <td><?= e($row->name) ?></td>
        <td><?= e($row->email) ?></td>
        <td><?= e($row->department) ?></td>
        <td><?= e($row->title) ?></td>
        <td><?= e($row->tenure) ?></td>
        <td><?php if ($row->active) { ?>Active<?php } else { ?>Inactive<?php } ?></td>
      </tr>
    <?php } ?>
  </tbody>
</table>
