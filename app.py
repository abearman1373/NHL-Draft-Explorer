import matplotlib.pyplot as plt
import pandas as pd
import streamlit as st

st.set_page_config(page_title="NHL Draft Explorer", layout="wide")

PRIMARY_POSITIONS = {"C": "Center", "LW": "Left Wing", "RW": "Right Wing", "D": "Defense", "G": "Goalie"}


@st.cache_data
def load_data():
    df = pd.read_csv("nhldraft.csv")
    # collapse messy position strings ("C/LW", "C RW", "Centr", ...) to a primary position
    df["primary_position"] = df["position"].fillna("").str.extract(r"([A-Z]+)")[0]
    df["primary_position"] = df["primary_position"].where(df["primary_position"].isin(PRIMARY_POSITIONS), other="Other")
    df["round"] = ((df["overall_pick"] - 1) // 31) + 1
    return df


df = load_data()

st.title("🏒 NHL Entry Draft Explorer")
st.caption(f"{df['year'].min()}–{df['year'].max()} · {len(df):,} draft picks")

st.sidebar.header("Filters")
year_range = st.sidebar.slider(
    "Draft year",
    int(df["year"].min()),
    int(df["year"].max()),
    (int(df["year"].min()), int(df["year"].max())),
)
positions = st.sidebar.multiselect(
    "Position",
    options=sorted(PRIMARY_POSITIONS.keys()),
    default=sorted(PRIMARY_POSITIONS.keys()),
    format_func=lambda p: PRIMARY_POSITIONS[p],
)

mask = df["year"].between(*year_range) & df["primary_position"].isin(positions)
filtered = df[mask]

st.markdown(f"**{len(filtered):,} picks** match the current filters")

col1, col2 = st.columns(2)

with col1:
    st.subheader("Picks by nationality")
    top_nat = filtered["nationality"].value_counts().head(10)
    fig, ax = plt.subplots()
    ax.barh(top_nat.index[::-1], top_nat.values[::-1], color="#1f77b4")
    ax.set_xlabel("Number of picks")
    st.pyplot(fig)

with col2:
    st.subheader("Picks by position")
    pos_counts = filtered["primary_position"].value_counts()
    fig, ax = plt.subplots()
    ax.pie(pos_counts.values, labels=pos_counts.index, autopct="%1.0f%%", startangle=90)
    ax.axis("equal")
    st.pyplot(fig)

st.subheader("Draft picks per year by position")
trend = filtered.groupby(["year", "primary_position"]).size().unstack(fill_value=0)
st.area_chart(trend)

st.subheader("Draft position vs. career points")
scored = filtered.dropna(subset=["points"])
fig, ax = plt.subplots(figsize=(10, 4))
colors = {"C": "#1f77b4", "LW": "#ff7f0e", "RW": "#2ca02c", "D": "#d62728", "G": "#9467bd", "Other": "#7f7f7f"}
for pos, group in scored.groupby("primary_position"):
    ax.scatter(group["overall_pick"], group["points"], s=8, alpha=0.5, label=PRIMARY_POSITIONS.get(pos, pos), color=colors.get(pos, "gray"))
ax.set_xlabel("Overall pick number")
ax.set_ylabel("Career points")
ax.legend(markerscale=2, loc="upper right")
st.pyplot(fig)

st.subheader("Best value draft rounds")
st.caption("Average point shares per pick, by round (round 1 = picks 1–31)")
round_value = filtered.dropna(subset=["point_shares"]).groupby("round")["point_shares"].mean().head(10)
fig, ax = plt.subplots()
ax.bar(round_value.index, round_value.values, color="#2ca02c")
ax.set_xlabel("Round")
ax.set_ylabel("Avg. point shares")
st.pyplot(fig)

with st.expander("Show raw data"):
    st.dataframe(filtered)
