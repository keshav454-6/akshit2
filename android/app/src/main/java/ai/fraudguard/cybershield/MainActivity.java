package ai.fraudguard.cybershield;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.AlertDialog;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Bundle;
import android.view.KeyEvent;
import android.view.View;
import android.webkit.ConsoleMessage;
import android.webkit.DownloadListener;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.Toast;

public class MainActivity extends Activity {

    private WebView mWebView;
    private ProgressBar mProgressBar;

    // Bundled offline HTML/JS assets
    private static final String OFFLINE_URL = "file:///android_asset/www/index.html";
    private static final String PREFS_NAME = "CyberShieldPrefs";
    private static final String KEY_SERVER_URL = "server_url";

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Layout with Ivory background
        android.widget.RelativeLayout layout = new android.widget.RelativeLayout(this);
        layout.setBackgroundColor(0xFFF5F3ED);

        mWebView = new WebView(this);
        mWebView.setBackgroundColor(0xFFF5F3ED);

        mProgressBar = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
        mProgressBar.setMax(100);
        mProgressBar.setVisibility(View.GONE);

        android.widget.RelativeLayout.LayoutParams webViewParams = new android.widget.RelativeLayout.LayoutParams(
                android.widget.RelativeLayout.LayoutParams.MATCH_PARENT,
                android.widget.RelativeLayout.LayoutParams.MATCH_PARENT
        );
        layout.addView(mWebView, webViewParams);

        android.widget.RelativeLayout.LayoutParams progressParams = new android.widget.RelativeLayout.LayoutParams(
                android.widget.RelativeLayout.LayoutParams.MATCH_PARENT,
                14
        );
        progressParams.addRule(android.widget.RelativeLayout.ALIGN_PARENT_TOP);
        layout.addView(mProgressBar, progressParams);

        setContentView(layout);

        // WebSettings configuration with universal file access for ES modules
        WebSettings webSettings = mWebView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setDatabaseEnabled(true);
        webSettings.setAllowFileAccess(true);
        webSettings.setAllowContentAccess(true);
        webSettings.setAllowFileAccessFromFileURLs(true);
        webSettings.setAllowUniversalAccessFromFileURLs(true);
        webSettings.setLoadWithOverviewMode(true);
        webSettings.setUseWideViewPort(true);
        webSettings.setSupportZoom(false);
        webSettings.setBuiltInZoomControls(false);
        webSettings.setDisplayZoomControls(false);
        webSettings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);

        // Prevent Android system dark mode from forcefully blackening our Ivory theme
        if (android.os.Build.VERSION.SDK_INT >= 29) {
            try {
                webSettings.setForceDark(WebSettings.FORCE_DARK_OFF);
            } catch (Throwable ignored) {}
        }

        // Security & Bridge Integration
        mWebView.addJavascriptInterface(new WebAppInterface(this), "Android");

        // Custom WebChromeClient for page loading status
        mWebView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onProgressChanged(WebView view, int newProgress) {
                if (newProgress < 100) {
                    mProgressBar.setVisibility(View.VISIBLE);
                    mProgressBar.setProgress(newProgress);
                } else {
                    mProgressBar.setVisibility(View.GONE);
                }
            }

            @Override
            public boolean onConsoleMessage(ConsoleMessage consoleMessage) {
                android.util.Log.d("CyberShieldWebView", consoleMessage.message() + " (Line "
                        + consoleMessage.lineNumber() + ")");
                return true;
            }
        });

        // Custom WebViewClient for internal navigation & fallback handling
        mWebView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                String url = request.getUrl().toString();
                if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("file:///")) {
                    return false; // Load inside WebView
                }
                try {
                    Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                    startActivity(intent);
                } catch (Exception e) {
                    Toast.makeText(MainActivity.this, "No application found to handle request", Toast.LENGTH_SHORT).show();
                }
                return true;
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                super.onReceivedError(view, request, error);
                // If remote server fails to load, gracefully fall back to bundled offline assets
                if (request.isForMainFrame() && !request.getUrl().toString().startsWith("file:///")) {
                    Toast.makeText(MainActivity.this, "Remote host unavailable. Loading offline security suite.", Toast.LENGTH_LONG).show();
                    mWebView.loadUrl(OFFLINE_URL);
                }
            }
        });

        // Download Listener
        mWebView.setDownloadListener(new DownloadListener() {
            @Override
            public void onDownloadStart(String url, String userAgent, String contentDisposition, String mimeType, long contentLength) {
                try {
                    Intent intent = new Intent(Intent.ACTION_VIEW);
                    intent.setData(Uri.parse(url));
                    startActivity(intent);
                } catch (Exception e) {
                    Toast.makeText(MainActivity.this, "Unable to download file", Toast.LENGTH_SHORT).show();
                }
            }
        });

        // Check if user saved a preferred live server URL, otherwise load bundled app
        SharedPreferences prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
        String savedUrl = prefs.getString(KEY_SERVER_URL, OFFLINE_URL);
        mWebView.loadUrl(savedUrl);
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (keyCode == KeyEvent.KEYCODE_BACK && mWebView.canGoBack()) {
            mWebView.goBack();
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (mWebView != null) {
            mWebView.onResume();
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (mWebView != null) {
            mWebView.onPause();
        }
    }

    @Override
    protected void onDestroy() {
        if (mWebView != null) {
            mWebView.destroy();
        }
        super.onDestroy();
    }
}
