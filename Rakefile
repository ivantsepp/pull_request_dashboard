require 'tmpdir'
require 'shellwords'

desc "Generate and publish site to gh-pages"
task :publish do
  Dir.mktmpdir do |tmp|
    system "grunt --env=production"
    break unless $?.success?
    unless %x{git status --short}.empty?
      stashed = true
      system "git stash"
    end
    system "mv build/* #{tmp}"
    system "mv .sass-cache/ #{tmp}/"
    system "mv node_modules/ #{tmp}/"
    system "mv .gitignore #{tmp}"
    system "git checkout gh-pages"
    break unless $?.success?
    system "rm -rf *"
    system "mv #{tmp}/* ./"

    message = "Site updated at #{Time.now.utc}"
    system "git add ."
    system "git commit -am #{message.shellescape}"
    system "git push ivantsepp gh-pages --force"
    system "git checkout master"
    if stashed
      system "git stash pop"
    end
  end
end
