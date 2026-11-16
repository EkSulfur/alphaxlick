# Alphaxlick

## Language

- [English](#english)
- [中文](#chinese)

---

<a id="english"></a>

A lightweight Microsoft Edge extension that helps you jump between arXiv paper pages and their corresponding AlphaXiv pages with one click.

## Features

- Floating **Open in AlphaXiv** button on `arxiv.org/abs/...`, `arxiv.org/pdf/...` and `arxiv.org/html/...` pages (the HTML view opens the AlphaXiv abstract page)
- Floating **Open arXiv HTML** button on AlphaXiv abstract and PDF pages (`www.alphaxiv.org/abs/...`, `/pdf/...`, `/overview/...`) that jumps to `arxiv.org/html/...`
- Both buttons are real links, so middle-click, Ctrl/Cmd+click and right-click → **Open link in new tab** work natively
- Both buttons are draggable. After a drag, the new position is saved automatically and becomes the default position on every future page
- Each floating button can be turned on or off from the extension popup, and the saved position can be reset to the top-right corner
- Popup also offers a one-click jump for the current tab
- Keeps the navigation simple and local, with no remote script loading

## Installation

### From source

1. Download or clone this repository.
2. Open Microsoft Edge and go to `edge://extensions`.
3. Enable **Developer mode**.
4. Click **Load unpacked**.
5. Select the repository folder.

## Usage

- Open an arXiv abstract, PDF or HTML page and click the floating **Open in AlphaXiv** button.
- On an AlphaXiv abstract or PDF page, click the floating **Open arXiv HTML** button to open the same paper on arXiv in HTML form.
- Right-click a floating button to open the target in a new tab, or middle-click / Ctrl+click it.
- Drag a floating button anywhere on the page: the position is stored immediately and reused as the new default (also after browser restarts, per button).
- Click the extension toolbar icon to open the popup, which lets you:
  - jump the current tab to the matching page with one click,
  - enable/disable the button on arXiv pages,
  - enable/disable the button on AlphaXiv pages,
  - reset the floating button position back to the top-right corner.

Settings are stored with `chrome.storage.local`, so they apply to every tab of the same browser profile.

## Permissions

This extension uses only the permissions needed for its core behavior:

- `tabs` — to read the active tab URL and navigate the current tab
- `storage` — to remember the button position and the on/off switches
- Host permissions for `arxiv.org` and `alphaxiv.org` — to detect supported pages and inject the floating buttons

## Releasing an update to the Edge Add-ons store

1. Bump `version` in `manifest.json` (must be greater than the published version).
2. Run `bash package.sh` — it builds `dist/alphaxlick-<version>.zip` with `manifest.json` at the archive root.
3. Extract the zip somewhere and load it via `edge://extensions` → **Load unpacked** once, to smoke-test the exact bytes you are about to upload.
4. Open [Partner Center](https://partner.microsoft.com/dashboard/microsoftedge/public/login) → **Microsoft Edge** → **Extensions** → your product → **Update** (new package) → upload the zip.
5. Add a note for the certification team if permissions changed, then **Submit**. Certification usually finishes in 1-3 business days; the update goes live for all users at once when it passes.
6. Users receive the update automatically (Edge re-checks periodically, usually within a day); they can force it from `edge://extensions` → **Update**.

Note: adding permissions (for example `storage` or a new host permission) may require users to re-approve the extension after the update.

## Privacy

This extension does not collect or transmit user data. It performs URL checks locally in the browser and redirects only when you click the button.

## Source Code

This project is open source. You can inspect, fork, and modify the code in this repository.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

---

<a id="chinese"></a>

一个轻量级的 Microsoft Edge 扩展，可以让你在 arXiv 论文页面与对应的 AlphaXiv 页面之间一键跳转。

## 功能

- 在 `arxiv.org/abs/...`、`arxiv.org/pdf/...` 和 `arxiv.org/html/...` 页面显示浮动的 **Open in AlphaXiv** 按钮（HTML 页面会跳转到 AlphaXiv 的摘要页）
- 在 AlphaXiv 的摘要页和 PDF 页（`www.alphaxiv.org/abs/...`、`/pdf/...`、`/overview/...`）显示浮动的 **Open arXiv HTML** 按钮，一键跳转到 `arxiv.org/html/...`
- 两个浮动按钮都可以拖动；拖动结束后会自动保存当前位置，并作为之后所有页面的默认位置
- 两个浮动按钮都是真正的链接，支持中键、Ctrl/Cmd+点击，以及右键菜单里的「在新标签页中打开链接」
- 两个浮动按钮都可以在扩展弹窗里单独开启或关闭，也可以一键把位置重置回右上角
- 弹窗里还提供当前标签页的一键跳转
- 逻辑简单、完全本地执行，不加载远程脚本

## 安装

### 从源码安装

1. 下载或克隆本仓库。
2. 打开 Microsoft Edge，访问 `edge://extensions`。
3. 开启 **开发者模式**。
4. 点击 **加载解压缩的扩展**。
5. 选择本仓库目录。

## 使用方法

- 打开 arXiv 的摘要页、PDF 页面或 HTML 页面，点击浮动的 **Open in AlphaXiv** 按钮。
- 打开 AlphaXiv 的摘要页或 PDF 页面，点击浮动的 **Open arXiv HTML** 按钮，即可在同一标签页打开该论文的 arXiv HTML 版本。
- 在浮动按钮上右键即可「在新标签页中打开链接」，也可以用中键或 Ctrl+点击。
- 拖动浮动按钮到任意位置：位置会立即保存，并作为新的默认位置（按按钮分别保存，浏览器重启后仍然有效）。
- 点击扩展工具栏图标打开弹窗，可以：
  - 一键把当前标签页跳转到对应页面，
  - 开启或关闭 arXiv 页面上的浮动按钮，
  - 开启或关闭 AlphaXiv 页面上的浮动按钮，
  - 把浮动按钮位置重置回右上角。

设置通过 `chrome.storage.local` 保存，对同一浏览器配置下的所有标签页生效。

## 权限说明

本扩展只使用实现核心功能所需的最小权限：

- `tabs`：用于读取当前标签页 URL 并跳转当前标签页
- `storage`：用于记住浮动按钮位置以及开启/关闭开关
- `arxiv.org` 和 `alphaxiv.org` 的主机权限：用于识别支持的页面并注入浮动按钮

## 发布更新到 Edge 加载项商店

1. 在 `manifest.json` 中提升 `version`（必须大于商店里已发布的版本，否则上传会被拒绝）。
2. 运行 `bash package.sh`，生成 `dist/alphaxlick-<version>.zip`，压缩包根目录就是 `manifest.json`。
3. 把 zip 解压到任意目录，先用 `edge://extensions` →「加载解压缩的扩展」试装一次，验证即将上传的那份文件确实可用。
4. 打开 [合作伙伴中心](https://partner.microsoft.com/dashboard/microsoftedge/public/login) → **Microsoft Edge** → **扩展** → 你的产品 → **更新**（上传新包）→ 选择 zip。
5. 如果权限有变化，在「认证说明」里写清楚原因，然后 **提交**。认证通常 1-3 个工作日，通过后一次性对所有用户生效。
6. 用户会自动收到更新（Edge 定期检查，一般在一天内）；也可以在 `edge://extensions` 点「更新」手动拉取。

注意：新增权限（例如 `storage` 或新的主机权限）可能要求用户在更新后重新确认授权。

## 隐私说明

本扩展不会收集或传输用户数据。所有 URL 检查都在浏览器本地完成，仅在用户点击按钮时执行跳转。

## 开源说明

本项目是开源的。你可以在本仓库中查看、分叉和修改代码。

## 许可证

本项目采用 MIT 协议。详情请查看 `LICENSE` 文件。
