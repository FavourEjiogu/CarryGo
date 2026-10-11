-- Run the marketplace view under the querying user's table permissions and RLS.
-- The authenticated marketplace already has base-table SELECT grants and a same-campus
-- RLS policy; the view should not elevate access to its owner's privileges.
alter view public.errands_marketplace set (security_invoker = true);
