var lists = [];
var timer, pgress;

function checkSpeed(url, name, lag) {
  var start = Date.now();
  $.getScript(url + "misc/u-boot-sunxi-with-spl.bin").then(function() {
    var score = (lag / 3600) * 0.39 + (Date.now() - start) * 0.61;
    lists.push({
      name: name,
      score: score,
      url: url
    });
  });
}

function updateProgress() {
  if (pgress >= 100) {
    clearInterval(timer);
    $("#pbar").fadeOut(300, function() {
      $("#gen-btn").fadeIn(733);
      $("#pdesc").fadeOut(500);
    });
    return;
  }
  pgress += 1;
  $("#pgs")[0].innerText = pgress + "%";
  $("#pgs")[0].style = "width:" + pgress + "%;";
}

function download(filename, text) {
  var pom = document.createElement("a");
  pom.setAttribute("style", "display: none;");
  pom.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(text));
  pom.setAttribute("download", filename);
  if (document.createEvent) {
    var event = document.createEvent("MouseEvents");
    event.initEvent("click", true, true);
    pom.dispatchEvent(event);
  } else {
    pom.click();
  }
}

function genList() {
  lists.sort(function(a, b) {
    if (a.score > b.score) return 1;
    if (a.score < b.score) return -1;
    return 0;
  });
  const final_result = lists;
  var output = "# Generated by AOSC Mirror Service\n";
  for (var i = 0; i < final_result.length; i++) {
    var prefix = (i ? "# " : "");
    output += `# ${final_result[i].name}\n${prefix}deb ${final_result[i].url}`;
    if ($("#testing-chkbox").is(":checked")) {
      output += " explosive";
    }
    output += " main\n#\n";
  }
  download("sources.list", output);
}

function startMeasurement() {
  $("#gen-btn").fadeOut(10);
  $("#pdesc").fadeIn(1333);
  lists = [];
  $.getJSON("/api/mirror-status", function(data) {
    var mirrors = data.mirrors;
    $("#pbar").fadeIn(100);
    pgress = 0;
    setTimeout(genList, 10000);
    timer = setInterval(updateProgress, 100);
    for (var mirror of mirrors) {
      checkSpeed(mirror.url, mirror.name, data.repo_info.lupd - mirror.lupd);
    }
  });
}
