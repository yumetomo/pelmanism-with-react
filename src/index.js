import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import _shuffle from 'lodash.shuffle';
import velocity from 'velocity-animate';
import Counter from './components/counter';
import './index.css';

class App extends Component {
  constructor() {
    super();
    this.state = {
      cards: [],
      count: 15
    };
    const colorData = [
      { text: '赤', color: '#eb0d0d', class: 'red' },
      { text: '青', color: '#0879ff', class: 'blue' },
      { text: '黄', color: '#ccdd09', class: 'yellow' },
      { text: '緑', color: '#00c926', class: 'green' },
      { text: '橙', color: '#ee861a', class: 'orange' },
      { text: '紫', color: '#b514e6', class: 'purple' },
      { text: '茶', color: '#8c6604', class: 'brown' },
      { text: '黒', color: '#000', class: 'black' }
    ];
    this.colors = colorData.concat(colorData);
    this.openCards = [];
    this.matchCount = 0;
    this.isAnimating = false;
    this.initialize();
  }

  /**
   * 初期化処理
   */
  initialize() {
    this.matchCount = 0;
    this.colors = _shuffle(this.colors);
    this.state.cards.splice(0, this.state.cards.length);
    for (let index = 0; index < this.colors.length; index++) {
      this.state.cards.push({ text: '?', index: index, status: '', color: '' });
    }
  }

  /**
   * 選択されたカードが既に開かれているか確認
   * @param {Number} index - 何番目のカードかの番号
   */
  verifyIsOpened(index) {
    const card = this.state.cards[index];
    const isOpened = card.status === 'open' || card.status === 'match';
    if (!isOpened && !this.isAnimating) this.open(index);
  }

  /**
   * カードを開く
   * @param {Number} index - 何番目のカードかの番号
   */
  open(index) {
    this.isAnimating = true;
    const cardsCopy = this.state.cards;
    cardsCopy[index].status = 'open';
    this.setState({ cards: cardsCopy });

    const $card = document.querySelectorAll('li')[index];
    const colorClass = this.colors[index].class;
    let isUpdated = false;
    velocity(
      $card,
      {
        rotateY: ['180deg', '0deg'],
        tween: 180
      },
      {
        duration: 400,
        progress: (elements, complete, remaining, start, tweenValue) => {
          // 半分までアニメーションしたらclassを付与して折り返す
          if (tweenValue >= 90) {
            const difference = tweenValue - 90;
            const rotateY = 90 - difference;
            $card.style.transform = `rotateY(${rotateY}deg)`;
            if (!isUpdated) {
              isUpdated = true;
              this.updateCardData(index, colorClass);
            }
          }
        },
        complete: () => {
          this.openCards.push(this.state.cards[index]);
          this.checkOpenCardLength();
        }
      }
    );
  }

  /**
   * カードのデータを更新
   * @param {Number} index - 何番目のカードかの番号
   * @param {String} colorClass - 要素に付与するclass
   */
  updateCardData(index, colorClass) {
    const cardsCopy = this.state.cards;
    cardsCopy[index].status = 'open';
    cardsCopy[index].color = colorClass;
    cardsCopy[index].text = this.colors[index].text;
    this.setState({ cards: cardsCopy });
  }

  /**
   * 開いているカードの枚数を確認
   */
  checkOpenCardLength() {
    // 2枚開いていたらカウントを1減らして判定へ
    if (this.openCards.length === 2) {
      this.setState({ count: this.state.count - 1 });
      this.judge();
    } else {
      this.isAnimating = false;
    }
  }

  /**
   * 選択された2枚が同じか判定
   */
  judge() {
    if (this.openCards[0].text === this.openCards[1].text) {
      this.matchCount += 2;
      const cardsCopy = this.state.cards;
      cardsCopy[this.openCards[0].index].status = 'match';
      cardsCopy[this.openCards[1].index].status = 'match';
      this.setState({ cards: cardsCopy });
      this.openCards.splice(0, 2);
      this.isAnimating = false;
    } else {
      this.close(document.querySelectorAll('li.open'));
    }

    this.verifyCount();
  }

  /**
   * 選択されたカードを閉じる
   */
  close($cards) {
    this.openCards.splice(0, 2);
    let isResets = false;
    velocity(
      $cards,
      {
        rotateY: ['180deg', '0deg'],
        tween: 180
      },
      {
        duration: 500,
        delay: 500,
        progress: (elements, complete, remaining, start, tweenValue) => {
          // 半分までアニメーションしたらclassを付与して折り返す
          if (tweenValue >= 90) {
            const difference = tweenValue - 90;
            const rotateY = 90 - difference;
            [...$cards].forEach($card => {
              $card.style.transform = `rotateY(${rotateY}deg)`;
              if (!isResets) {
                this.resetCardData(parseInt($card.dataset.index, 10));
              }
            });
            isResets = true;
          }
        },
        complete: () => {
          this.isAnimating = false;
        }
      }
    );
  }

  /**
   * カードを閉じた状態に戻す
   * @param {Number} index - 何番目のカードかの番号
   */
  resetCardData(index) {
    const cardsCopy = this.state.cards;
    cardsCopy[index].status = '';
    cardsCopy[index].color = '';
    cardsCopy[index].text = '?';
    this.setState({ cards: cardsCopy });
  }

  /**
   * 残り回数の確認
   */
  verifyCount() {
    const isAllMatch = this.matchCount === this.colors.length;

    if (isAllMatch) {
      alert('complete!!');
    } else if (this.state.count === 0) {
      alert('failed...');
    }

    if (isAllMatch || this.state.count === 0) {
      this.setState({ count: 15 });
      this.initialize();
      this.close(document.querySelectorAll('li.match'));
    }
  }

  /**
   * カード部分の要素を返す
   */
  renderCards() {
    return this.state.cards.map((card, index) => (
      <li
        key={card.index}
        data-index={card.index}
        className={`${card.status} ${card.color}`}
        onClick={this.verifyIsOpened.bind(this, index)}
      >
        {card.text}
      </li>
    ));
  }

  /**
   * レンダリング
   */
  render() {
    return (
      <div className="App">
        <Counter count={this.state.count} />
        <div className="wrap">
          <ul>
            {/* <li className={(card.status, card.color)}>{card.text}</li> */}
            {this.renderCards()}
          </ul>
        </div>
      </div>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('root'));
