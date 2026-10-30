import { runNaturalLanguageQuery, getQueryHistory } from './analytics.service.js';

export async function handleQuery(req, res) {
  const { question } = req.body;
  const result = await runNaturalLanguageQuery({ question, userId: req.user.id });
  res.json({ success: true, data: result });
}

export async function handleHistory(req, res) {
  const page = parseInt(req.query.page || '1', 10);
  const pageSize = parseInt(req.query.pageSize || '20', 10);
  const result = await getQueryHistory(req.user.id, { page, pageSize });
  res.json({ success: true, data: result });
}

