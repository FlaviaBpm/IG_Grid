# Instagram grid preview for Notion

Reads the Instagram posts from your "Master Content Calendar" and shows them as an Instagram-style grid, with live Canva previews, that you can embed on any Notion page. Free to run on Vercel's Hobby plan.

What it shows: every post where Canal = Instagram, except cancelled ones (État = Annulé) and Stories. Newest Deadline top left, posts with no date at the very top. Non-published posts get a status badge in your Notion colours. Click a tile to see the design full size (carousels can be swiped) with buttons to open it in Notion or Canva.

## 1. Create a Notion integration (2 min)

1. Go to https://www.notion.so/profile/integrations and click "New integration".
2. Name it "IG Grid", pick your workspace, type "Internal", and save.
3. Copy the "Internal Integration Secret". This is your NOTION_TOKEN.
4. Open the Master Content Calendar in Notion, click the ••• menu at the top right, then "Connections", and add "IG Grid".

Your database ID is the 32-character code in its link: 8beba69c07e14650b1270bf4395b8864

## 2. Put it online with Vercel (5 min)

1. Create a free account at https://vercel.com (sign in with GitHub, GitLab or email).
2. The easiest route: create a new GitHub repository, upload the contents of this folder (index.html, the api folder, this README), then in Vercel click "Add New" > "Project" and import that repository.
3. Before clicking Deploy, open "Environment Variables" and add:
   - NOTION_TOKEN = the secret from step 1
   - NOTION_DATABASE_ID = 8beba69c07e14650b1270bf4395b8864
   - ACCESS_KEY = any word you like (optional, but recommended so the link is not readable by anyone who guesses it)
4. Deploy. You get a link like https://ig-grid-flavia.vercel.app

## 3. Embed it in Notion

On any Notion page, type /embed and paste your link. Useful variants:

- https://YOUR-LINK.vercel.app/?key=YOURKEY  (all accounts, with tabs)
- https://YOUR-LINK.vercel.app/?brand=Waltex&key=YOURKEY
- https://YOUR-LINK.vercel.app/?brand=Squarenuts%20BE&key=YOURKEY
- https://YOUR-LINK.vercel.app/?brand=Boost%20Up&key=YOURKEY

Drag the embed's corner to make it taller. Press "Refresh" in the widget after editing the calendar.

## 4. Make the Canva link show the live design

The "Canva Link" column must contain a link that anyone can view:

1. In Canva, click Share, then set "Collaboration link" access to "Anyone with the link" can view. Or, in Share > "More" > "Embed", copy the smart embed link.
2. Paste that link into the post's "Canva Link" in Notion.

Every time you edit the design in Canva, the tile updates on the next refresh. No re-uploading.

If a post has no Canva link, the widget uses the Notion page cover instead, then just the title.

## Good to know

- Your Notion secret stays on Vercel, never in the page itself.
- If you rename a column in Notion (Titre, Canal, Marque, Type de post, État, Deadline, Canva Link, Artiste / Client), update the names at the top of api/feed.js.
- Open index.html directly on your computer to see a demo with placeholder posts.
- Many Canva previews on one page can load slowly. Filtering by brand keeps it fast.
