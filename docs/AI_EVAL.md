# AI evaluation (threshold 0.2)

- Member queries: 18, top-1 accuracy: 100.00%
- No-match queries: 6, rejection accuracy: 100.00%

| Query | Expected | Got | Confidence | OK |
|---|---|---|---|---|
| Tell me about Member One | m1 | m1 | 0.950 | yes |
| Who is the product and GitHub lead? | m1 | m1 | 0.374 | yes |
| Who managed backlog planning and release packaging? | m1 | m1 | 0.310 | yes |
| Tell me about Member Two | m2 | m2 | 0.950 | yes |
| Who knows TF-IDF and scikit-learn? | m2 | m2 | 0.328 | yes |
| Who built the TF-IDF matching engine and no-match logic? | m2 | m2 | 0.294 | yes |
| Tell me about Member Three | m3 | m3 | 0.950 | yes |
| Who is the API and integration engineer? | m3 | m3 | 0.320 | yes |
| Who implemented the FastAPI service and deployment? | m3 | m3 | 0.471 | yes |
| Tell me about Member Four | m4 | m4 | 0.950 | yes |
| Who is the mobile UI and navigation engineer? | m4 | m4 | 0.342 | yes |
| Who built the mobile UI screens and profile presentation? | m4 | m4 | 0.315 | yes |
| Tell me about Member Five | m5 | m5 | 0.950 | yes |
| Who is the offline and quality engineer? | m5 | m5 | 0.365 | yes |
| Who handled offline caching with AsyncStorage and NetInfo? | m5 | m5 | 0.287 | yes |
| Tell me about Member Six | m6 | m6 | 0.950 | yes |
| Who is the release and evidence engineer? | m6 | m6 | 0.358 | yes |
| Who generated the EAS APK build and test matrix? | m6 | m6 | 0.302 | yes |
| What is the weather in Kigali today? | None | None | 0.043 | yes |
| Recipe for cooking potatoes | None | None | 0.050 | yes |
| Who won the football match? | None | None | 0.154 | yes |
| Tell me something random | None | None | 0.035 | yes |
| Explain quantum physics | None | None | 0.035 | yes |
| Bitcoin price forecast | None | None | 0.056 | yes |

## Error table

None.