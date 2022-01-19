<?php
/*
  Snippets are a great way to store code snippets for reuse
  or to keep your templates clean.

  This footer snippet is reused in all templates.

  More about snippets:
  https://getkirby.com/docs/guide/templates/snippets
*/
?>
  </main>

  <footer class="footer">
    <div class="grid">
      <!-- <div class="column" style="--columns: 8">
        <h2><a href="https://getkirby.com">Made with Kirby</a></h2>
        <p>
          Kirby: the file-based CMS that adapts to any project, loved by developers and editors alike
        </p>
      </div> -->
      <!-- <div class="column" style="--columns: 2">
        <h2>Pages</h2>
        <ul>
          <?php foreach ($site->children()->listed() as $example): ?>
          <li><a href="<?= $example->url() ?>"><?= $example->title()->html() ?></a></li>
          <?php endforeach ?>
        </ul>
      </div> -->
      <div class="column" style="--columns: 2">
        <h2>As seen on:</h2>
        <ul>
          <li><a href="https://twitter.com/erniedesigns" target="_blank">Twitter</a></li>
          <li><a href="https://www.polywork.com/seriousness" target="_blank">Polywork</a></li>
          <li><a href="https://www.linkedin.com/in/evanwoerden/" target="_blank">LinkedIn</a></li>
          <li><a href="https://dribbble.com/seriousness" target="_blank">Dribbble</a></li>
        </ul>
      </div>
    </div>
  </footer>

  <?= js([
    'assets/js/prism.js',
    'assets/js/lightbox.js',
    'assets/js/index.js',
    '@auto'
  ]) ?>

</body>
</html>
