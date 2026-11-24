// Reads the Instagram posts from the Notion "Master Content Calendar"
// and returns them as JSON for the grid page (index.html).
//
// Environment variables to set in Vercel:
//   NOTION_TOKEN        the secret of your Notion integration
//   NOTION_DATABASE_ID  the ID of the Master Content Calendar database
//   ACCESS_KEY          optional: if set, the widget link must end with ?key=THE_SAME_VALUE

const NOTION_VERSION = "2022-06-28";

// Property names exactly as they are in your Notion database.
// If you rename a column in Notion, change it here too.
const P = {
  title: "Titre",
  channel: "Canal",
  brand: "Marque",
  type: "Type de post",
  status: "État",
  date: "Deadline",
  canva: "Canva Link",
  client: "Artiste / Client",
};

function plain(prop) {
  if (!prop) return "";
  const parts = prop.title || prop.rich_text || [];
  return parts.map((t) => t.plain_text).join("");
}

function toPost(page) {
  const pr = page.properties || {};
  let cover = null;
  if (page.cover) {
    cover = page.cover.type === "external" ? page.cover.external.url : page.cover.file.url;
  }
  return {
    id: page.id,
    url: page.url,
    title: plain(pr[P.title]),
    brand: (pr[P.brand] && pr[P.brand].select && pr[P.brand].select.name) || "",
    type: (pr[P.type] && pr[P.type].select && pr[P.type].select.name) || "",
    status: (pr[P.status] && pr[P.status].status && pr[P.status].status.name) || "",
    date: (pr[P.date] && pr[P.date].date && pr[P.date].date.start) || null,
    canva: (pr[P.canva] && pr[P.canva].url) || null,
    client: plain(pr[P.client]),
    cover,
  };
}

module.exports = async (req, res) => {
  const token = process.env.NOTION_TOKEN;
  const dbId = process.env.NOTION_DATABASE_ID;
  const accessKey = process.env.ACCESS_KEY;

  if (accessKey && req.query.key !== accessKey) {
    res.status(401).json({ error: "This link is missing the right ?key= value." });
    return;
  }
  if (!token || !dbId) {
    res.status(500).json({ error: "NOTION_TOKEN or NOTION_DATABASE_ID is not set in Vercel." });
    return;
  }

  const filter = {
    and: [
      { property: P.channel, select: { equals: "Instagram" } },
      { property: P.status, status: { does_not_equal: "Annulé" } },
    ],
  };

  const posts = [];
  let cursor;
  let rounds = 0;

  try {
    do {
      const r = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Notion-Version": NOTION_VERSION,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filter,
          sorts: [{ property: P.date, direction: "descending" }],
          page_size: 100,
          start_cursor: cursor,
        }),
      });
      const data = await r.json();
      if (!r.ok) {
        res.status(r.status).json({ error: data.message || "Notion refused the request." });
        return;
      }
      for (const page of data.results) posts.push(toPost(page));
      cursor = data.has_more ? data.next_cursor : undefined;
      rounds += 1;
    } while (cursor && rounds < 5);
  } catch (e) {
    res.status(502).json({ error: "Could not reach Notion: " + e.message });
    return;
  }

  // Short canva.link links: follow the redirect to get the full
  // canva.com/design/... address, so the grid can show the preview.
  await Promise.all(
    posts.map(async (p) => {
      if (!p.canva || !/^https?:\/\/(www\.)?canva\.link\//i.test(p.canva)) return;
      try {
        const r = await fetch(p.canva, { method: "HEAD", redirect: "manual" });
        const loc = r.headers.get("location");
        if (loc && /canva\.com\/design\//.test(loc)) p.canva = loc;
      } catch (e) {
        // Keep the short link if Canva can't be reached.
      }
    })
  );

  res.setHeader("Cache-Control", "s-maxage=20, stale-while-revalidate=60");
  res.status(200).json({ posts, updated: new Date().toISOString() });
};
