# Tiny static server for local dev — serves ./public at http://localhost:8080
# Run:  powershell -ExecutionPolicy Bypass -File serve.ps1
$port = 8080
$root = Join-Path $PSScriptRoot "public"
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()
Write-Host "GC Attendance Portal running at http://localhost:$port/  (Ctrl+C to stop)"
$mime = @{ ".html"="text/html"; ".js"="text/javascript"; ".css"="text/css"; ".json"="application/json"; ".svg"="image/svg+xml" }
try {
  while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    $path = $ctx.Request.Url.LocalPath.TrimStart("/"); if ($path -eq "") { $path = "index.html" }
    $file = Join-Path $root $path
    if (Test-Path $file -PathType Leaf) {
      $bytes = [System.IO.File]::ReadAllBytes($file)
      $ext = [System.IO.Path]::GetExtension($file)
      if ($mime.ContainsKey($ext)) { $ctx.Response.ContentType = $mime[$ext] }
      $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else { $ctx.Response.StatusCode = 404 }
    $ctx.Response.Close()
  }
} finally { $listener.Stop() }
